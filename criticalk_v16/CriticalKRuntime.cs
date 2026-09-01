using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.Runtime.InteropServices;
using System.Runtime.InteropServices.ComTypes;
using System.Threading;
using System.Windows.Forms;
using SolidWorks.Interop.sldworks;

[assembly: System.Reflection.AssemblyTitle("Tooldur Critical K Runtime")]
[assembly: System.Reflection.AssemblyCompany("Tooldur")]
[assembly: System.Reflection.AssemblyVersion("1.6.0.0")]
[assembly: System.Reflection.AssemblyFileVersion("1.6.0.0")]

namespace Tooldur.CriticalKRuntime
{
    internal static class Program
    {
        private static Mutex singleInstance;

        [STAThread]
        private static void Main()
        {
            bool created;
            singleInstance = new Mutex(true, "Local\\Tooldur_CriticalK_Runtime_SW2024", out created);
            if (!created) return;

            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            RuntimeController controller = new RuntimeController();
            Application.ApplicationExit += delegate { controller.Dispose(); };
            Application.Run(new ApplicationContext());
        }
    }

    internal sealed class RuntimeController : IDisposable
    {
        private const int SwDocDrawing = 3;
        private const int SwAnnDisplayDimension = 4;
        private const int SwAnnGtol = 5;
        private const int SwAnnNote = 6;
        private const int SwBalloonCircular = 1;
        private const int SwBalloonTightest = 0;
        private const int SwLeaderStraight = 1;
        private const int SwLeaderSmart = 0;

        private const string NotePrefix = "CKPDM2_";
        private const double MoveEpsilon = 0.000001;
        private const double DefaultKOffsetX = -0.008;
        private const double DefaultKOffsetY = 0.0;
        private const double LeaderClearance = 0.0010;

        private readonly System.Windows.Forms.Timer timer;
        private readonly HotKeyWindow hotKey;
        private readonly List<Tracker> trackers = new List<Tracker>();
        private bool hotKeyPending;
        private bool busy;
        private int lastToolbarLoadPid = -1;
        private DateTime lastRequest = DateTime.MinValue;

        private sealed class Tracker
        {
            public string DocKey;
            public INote Note;
            public byte[] TargetPersistId;
            public double[] AttachOffset;
            public double[] LastTargetPos;
            public double[] LastNotePos;
        }

        public RuntimeController()
        {
            Log("Runtime START v1.6.0 - TYPED SW2024 INTEROP / DIM + GTOL + NOTE + BAYKAL TAB AUTOLOAD");

            hotKey = new HotKeyWindow(delegate
            {
                DateTime now = DateTime.Now;
                if ((now - lastRequest).TotalMilliseconds < 250) return;
                lastRequest = now;
                hotKeyPending = true;
                Log("HOTKEY Shift+X queued.");
            });

            timer = new System.Windows.Forms.Timer();
            timer.Interval = 250;
            timer.Tick += Timer_Tick;
            timer.Start();
        }

        public void Dispose()
        {
            try { timer.Stop(); } catch { }
            try { timer.Dispose(); } catch { }
            try { hotKey.Dispose(); } catch { }
            trackers.Clear();
            Log("Runtime STOP");
        }

        private void Timer_Tick(object sender, EventArgs e)
        {
            try
            {
                bool swForeground = IsSolidWorksForeground();
                hotKey.SetEnabled(swForeground);

                if (hotKeyPending && swForeground && !busy)
                {
                    hotKeyPending = false;
                    busy = true;
                    try
                    {
                        Log("HOTKEY Shift+X executing.");
                        AddCriticalK();
                    }
                    catch (Exception ex)
                    {
                        Log("AddCriticalK top-level ERROR: " + ex);
                    }
                    finally { busy = false; }
                    return;
                }

                if (busy || !swForeground) return;

                int swPid;
                if (!TryGetForegroundSolidWorksPid(out swPid)) return;

                ISldWorks sw = TryGetSolidWorks(swPid, false);
                if (sw == null) return;

                EnsureBaykalToolbarLoaded(sw, swPid);

                IModelDoc2 doc = null;
                try { doc = sw.ActiveDoc as IModelDoc2; } catch { }
                if (doc == null) return;

                int docType;
                try { docType = doc.GetType(); } catch { return; }
                if (docType != SwDocDrawing) return;

                string docKey = GetDocKey(doc);
                bool redraw = false;

                for (int i = trackers.Count - 1; i >= 0; i--)
                {
                    Tracker t = trackers[i];
                    if (!string.Equals(t.DocKey, docKey, StringComparison.OrdinalIgnoreCase)) continue;

                    bool keep, changed;
                    UpdateTracker(doc, t, out keep, out changed);
                    if (!keep) trackers.RemoveAt(i);
                    else if (changed) redraw = true;
                }

                if (redraw)
                {
                    try { doc.GraphicsRedraw2(); } catch { }
                }
            }
            catch (Exception ex)
            {
                Log("Timer ERROR: " + ex);
            }
        }

        private void AddCriticalK()
        {
            int swPid;
            if (!TryGetForegroundSolidWorksPid(out swPid))
            {
                Show("SOLIDWORKS aktif pencere olarak bulunamadi.");
                return;
            }

            Log("Foreground SLDWORKS pid=" + swPid.ToString(CultureInfo.InvariantCulture));
            ISldWorks sw = TryGetSolidWorks(swPid, true);
            if (sw == null)
            {
                Show("Aktif SOLIDWORKS 2024 oturumuna baglanilamadi.\r\nCriticalKRuntime.log dosyasini gonder.");
                return;
            }

            EnsureBaykalToolbarLoaded(sw, swPid);

            IModelDoc2 doc = null;
            try
            {
                doc = sw.ActiveDoc as IModelDoc2;
                Log("Typed ActiveDoc=" + (doc == null ? "NULL" : "OK"));
            }
            catch (Exception ex)
            {
                Log("Typed ActiveDoc ERROR: " + ex);
            }

            if (doc == null)
            {
                Show("Aktif SOLIDWORKS oturumu bulundu ama aktif dokuman okunamadi.\r\nCriticalKRuntime.log dosyasini gonder.");
                return;
            }

            int docType = -1;
            try { docType = doc.GetType(); } catch (Exception ex) { Log("doc.GetType ERROR: " + ex); }
            Log("ActiveDoc type=" + docType.ToString(CultureInfo.InvariantCulture) + " title=" + SafeTitle(doc));
            if (docType != SwDocDrawing)
            {
                Show("Critical K sadece teknik resimde calisir.");
                return;
            }

            ISelectionMgr sel = null;
            try { sel = doc.SelectionManager as ISelectionMgr; } catch (Exception ex) { Log("SelectionManager ERROR: " + ex); }
            if (sel == null)
            {
                Show("Secim okunamadi.");
                return;
            }

            int count = 0;
            try { count = sel.GetSelectedObjectCount2(-1); } catch (Exception ex) { Log("Selection count ERROR: " + ex); }
            Log("Selection count=" + count.ToString(CultureInfo.InvariantCulture));
            if (count != 1)
            {
                Show("Bir olcu, geometrik tolerans veya not sec, sonra Shift+X bas.");
                return;
            }

            object selected = null;
            try { selected = sel.GetSelectedObject6(1, -1); } catch (Exception ex) { Log("GetSelectedObject6 ERROR: " + ex); }
            if (selected == null)
            {
                Show("Secilen nesne okunamadi.");
                return;
            }

            IAnnotation targetAnn = GetTargetAnnotation(selected);
            if (targetAnn == null)
            {
                Show("Sadece olcu, geometrik tolerans veya not secilebilir.");
                return;
            }

            int annType = -1;
            try { annType = targetAnn.GetType(); } catch (Exception ex) { Log("targetAnn.GetType ERROR: " + ex); }
            Log("Target annotation type=" + annType.ToString(CultureInfo.InvariantCulture));
            if (annType != SwAnnDisplayDimension && annType != SwAnnGtol && annType != SwAnnNote)
            {
                Show("Sadece olcu, geometrik tolerans veya not secilebilir.");
                return;
            }

            double[] targetPos = null;
            try { targetPos = ToDoubleArray(targetAnn.GetPosition()); } catch (Exception ex) { Log("GetPosition ERROR: " + ex); }
            if (targetPos == null || targetPos.Length < 2)
            {
                Show("Secilen annotation konumu okunamadi.");
                return;
            }
            targetPos = Ensure3(targetPos);

            byte[] pid = GetPersistId(doc, selected);
            if (pid == null || pid.Length == 0) pid = GetPersistId(doc, targetAnn);
            if (pid == null || pid.Length == 0)
            {
                Show("Secilen annotation icin kalici referans olusturulamadi.");
                return;
            }

            double xK = targetPos[0] + DefaultKOffsetX;
            double yK = targetPos[1] + DefaultKOffsetY;
            double zK = targetPos[2];

            doc.ClearSelection2(true);

            INote note = null;
            try { note = doc.InsertNote("K") as INote; } catch (Exception ex) { Log("InsertNote ERROR: " + ex); }
            if (note == null)
            {
                Show("K notu olusturulamadi.");
                return;
            }

            try { note.SetBalloon(SwBalloonCircular, SwBalloonTightest); } catch (Exception ex) { Log("SetBalloon WARN: " + ex.Message); }

            IAnnotation kAnn = null;
            try { kAnn = note.GetAnnotation() as IAnnotation; } catch { }
            if (kAnn == null)
            {
                Show("K annotation okunamadi.");
                return;
            }

            try { kAnn.Color = ColorTranslator.ToOle(Color.Red); } catch { }
            try { kAnn.SetPosition2(xK, yK, zK); } catch (Exception ex) { Log("SetPosition2 ERROR: " + ex); }
            try { kAnn.SetLeader3(SwLeaderStraight, SwLeaderSmart, true, false, false, false); } catch (Exception ex) { Log("SetLeader3 WARN: " + ex.Message); }

            double[] notePos = GetAnnotationPosition(kAnn);
            if (notePos == null) notePos = new double[] { xK, yK, zK };

            double[] attach = CalculateLeaderTarget(notePos, targetPos);
            SetLeaderPoint(kAnn, attach);

            double[] offset = new double[] { attach[0] - targetPos[0], attach[1] - targetPos[1], attach[2] - targetPos[2] };
            string noteName = BuildNoteName(pid, offset);
            try { kAnn.SetName(noteName); } catch { }

            Tracker tracker = new Tracker();
            tracker.DocKey = GetDocKey(doc);
            tracker.Note = note;
            tracker.TargetPersistId = pid;
            tracker.AttachOffset = offset;
            tracker.LastTargetPos = targetPos;
            tracker.LastNotePos = notePos;
            trackers.Add(tracker);

            doc.ClearSelection2(true);
            try { doc.GraphicsRedraw2(); } catch { }
            Log("AddCriticalK SUCCESS type=" + annType.ToString(CultureInfo.InvariantCulture));
        }

        private static IAnnotation GetTargetAnnotation(object selected)
        {
            if (selected == null) return null;
            try
            {
                IAnnotation direct = selected as IAnnotation;
                if (direct != null) return direct;
            }
            catch { }
            try
            {
                IDisplayDimension d = selected as IDisplayDimension;
                if (d != null) return d.GetAnnotation() as IAnnotation;
            }
            catch { }
            try
            {
                IGtol g = selected as IGtol;
                if (g != null) return g.GetAnnotation() as IAnnotation;
            }
            catch { }
            try
            {
                INote n = selected as INote;
                if (n != null) return n.GetAnnotation() as IAnnotation;
            }
            catch { }
            try
            {
                dynamic x = selected;
                return x.GetAnnotation() as IAnnotation;
            }
            catch { return null; }
        }

        private void UpdateTracker(IModelDoc2 doc, Tracker t, out bool keep, out bool changed)
        {
            keep = true;
            changed = false;

            if (t == null || t.Note == null || t.TargetPersistId == null)
            {
                keep = false;
                return;
            }

            IAnnotation noteAnn = null;
            try { noteAnn = t.Note.GetAnnotation() as IAnnotation; } catch { }
            if (noteAnn == null)
            {
                keep = false;
                return;
            }

            object target = GetObjectFromPersistId(doc, t.TargetPersistId);
            if (target == null)
            {
                keep = false;
                return;
            }

            IAnnotation targetAnn = GetTargetAnnotation(target);
            if (targetAnn == null)
            {
                keep = false;
                return;
            }

            double[] targetPos = GetAnnotationPosition(targetAnn);
            double[] notePos = GetAnnotationPosition(noteAnn);
            if (targetPos == null || notePos == null) return;

            bool targetMoved = t.LastTargetPos == null || Distance2(targetPos[0], targetPos[1], t.LastTargetPos[0], t.LastTargetPos[1]) > MoveEpsilon;
            bool noteMoved = t.LastNotePos == null || Distance2(notePos[0], notePos[1], t.LastNotePos[0], t.LastNotePos[1]) > MoveEpsilon;

            if (!targetMoved && !noteMoved) return;

            double[] attach = CalculateLeaderTarget(notePos, targetPos);
            SetLeaderPoint(noteAnn, attach);
            t.AttachOffset = new double[] { attach[0] - targetPos[0], attach[1] - targetPos[1], attach[2] - targetPos[2] };
            t.LastTargetPos = targetPos;
            t.LastNotePos = notePos;
            changed = true;
        }

        private static double[] CalculateLeaderTarget(double[] notePos, double[] targetPos)
        {
            double dx = notePos[0] - targetPos[0];
            double dy = notePos[1] - targetPos[1];
            double d = Math.Sqrt(dx * dx + dy * dy);
            if (d < 0.0000001) return new double[] { targetPos[0], targetPos[1], targetPos[2] };
            return new double[]
            {
                targetPos[0] + (dx / d) * LeaderClearance,
                targetPos[1] + (dy / d) * LeaderClearance,
                targetPos[2]
            };
        }

        private static void SetLeaderPoint(IAnnotation ann, double[] p)
        {
            try
            {
                if (ann.GetLeaderCount() > 0)
                    ann.SetLeaderAttachmentPointAtIndex(0, p[0], p[1], p[2]);
            }
            catch { }
        }

        private static double[] GetAnnotationPosition(IAnnotation ann)
        {
            try { return Ensure3(ToDoubleArray(ann.GetPosition())); } catch { return null; }
        }

        private static byte[] GetPersistId(IModelDoc2 doc, object obj)
        {
            try
            {
                IModelDocExtension ext = doc.Extension;
                int err = 0;
                object v = ext.GetPersistReference3(obj, out err);
                return ToByteArray(v);
            }
            catch { return null; }
        }

        private static object GetObjectFromPersistId(IModelDoc2 doc, byte[] id)
        {
            try
            {
                int err = 0;
                return doc.Extension.GetObjectByPersistReference3(id, out err);
            }
            catch { return null; }
        }

        private static ISldWorks TryGetSolidWorks(int processId, bool verbose)
        {
            IBindCtx bindCtx = null;
            IRunningObjectTable rot = null;
            IEnumMoniker enumMoniker = null;
            try
            {
                int hr = CreateBindCtx(0, out bindCtx);
                if (hr != 0 || bindCtx == null) return null;
                bindCtx.GetRunningObjectTable(out rot);
                if (rot == null) return null;
                rot.EnumRunning(out enumMoniker);
                if (enumMoniker == null) return null;

                IMoniker[] monikers = new IMoniker[1];
                IntPtr fetched = Marshal.AllocCoTaskMem(sizeof(int));
                try
                {
                    while (enumMoniker.Next(1, monikers, fetched) == 0)
                    {
                        IMoniker m = monikers[0];
                        string name = null;
                        try { m.GetDisplayName(bindCtx, null, out name); } catch { }
                        if (string.IsNullOrEmpty(name) || name.IndexOf("SolidWorks_PID_" + processId.ToString(CultureInfo.InvariantCulture), StringComparison.OrdinalIgnoreCase) < 0)
                        {
                            try { Marshal.ReleaseComObject(m); } catch { }
                            continue;
                        }

                        object appObj = null;
                        try { rot.GetObject(m, out appObj); } catch { }
                        try { Marshal.ReleaseComObject(m); } catch { }
                        if (appObj == null) continue;

                        ISldWorks sw = appObj as ISldWorks;
                        if (sw == null)
                        {
                            try { Marshal.ReleaseComObject(appObj); } catch { }
                            return null;
                        }

                        try
                        {
                            int actualPid = sw.GetProcessID();
                            if (verbose) Log("Typed ISldWorks OK. GetProcessID=" + actualPid);
                            if (actualPid != processId)
                            {
                                if (verbose) Log("PID mismatch wanted=" + processId + " actual=" + actualPid);
                                return null;
                            }
                        }
                        catch (Exception ex)
                        {
                            if (verbose) Log("Typed ISldWorks.GetProcessID ERROR: " + ex);
                            return null;
                        }

                        return sw;
                    }
                }
                finally { Marshal.FreeCoTaskMem(fetched); }
            }
            catch (Exception ex)
            {
                if (verbose) Log("TryGetSolidWorks TYPED ROT ERROR: " + ex);
            }
            finally
            {
                if (enumMoniker != null) { try { Marshal.ReleaseComObject(enumMoniker); } catch { } }
                if (rot != null) { try { Marshal.ReleaseComObject(rot); } catch { } }
                if (bindCtx != null) { try { Marshal.ReleaseComObject(bindCtx); } catch { } }
            }

            return null;
        }

        private void EnsureBaykalToolbarLoaded(ISldWorks sw, int swPid)
        {
            if (sw == null) return;
            if (lastToolbarLoadPid == swPid) return;

            try
            {
                string dll = Path.Combine(
                    System.Environment.GetFolderPath(System.Environment.SpecialFolder.LocalApplicationData),
                    "Tooldur", "CriticalK", "CriticalK_SW2024_BAYKAL.dll");

                if (!File.Exists(dll))
                {
                    Log("BAYKAL toolbar DLL bulunamadi: " + dll);
                    return;
                }

                int status = sw.LoadAddIn(dll);
                Log("BAYKAL LoadAddIn status=" + status.ToString(CultureInfo.InvariantCulture) + " path=" + dll);
                lastToolbarLoadPid = swPid;
            }
            catch (Exception ex)
            {
                Log("BAYKAL LoadAddIn ERROR: " + ex);
            }
        }

        private static bool TryGetForegroundSolidWorksPid(out int processId)
        {
            processId = 0;
            try
            {
                IntPtr hwnd = GetForegroundWindow();
                if (hwnd == IntPtr.Zero) return false;
                uint pid;
                GetWindowThreadProcessId(hwnd, out pid);
                if (pid == 0) return false;
                Process p = Process.GetProcessById((int)pid);
                if (!string.Equals(p.ProcessName, "SLDWORKS", StringComparison.OrdinalIgnoreCase)) return false;
                processId = (int)pid;
                return true;
            }
            catch { return false; }
        }

        private static bool IsSolidWorksForeground()
        {
            int pid;
            return TryGetForegroundSolidWorksPid(out pid);
        }

        private static string GetDocKey(IModelDoc2 doc)
        {
            try
            {
                string p = doc.GetPathName();
                if (!string.IsNullOrEmpty(p)) return p.ToUpperInvariant();
                string t = doc.GetTitle();
                return string.IsNullOrEmpty(t) ? "UNSAVED" : t.ToUpperInvariant();
            }
            catch { return "ACTIVE"; }
        }

        private static string SafeTitle(IModelDoc2 doc)
        {
            try { return doc.GetTitle() ?? ""; } catch { return "?"; }
        }

        private static byte[] ToByteArray(object value)
        {
            if (value == null) return null;
            byte[] b = value as byte[];
            if (b != null) return b;
            Array a = value as Array;
            if (a == null) return null;
            byte[] result = new byte[a.Length];
            for (int i = 0; i < a.Length; i++) result[i] = Convert.ToByte(a.GetValue(i), CultureInfo.InvariantCulture);
            return result;
        }

        private static double[] ToDoubleArray(object value)
        {
            if (value == null) return null;
            double[] d = value as double[];
            if (d != null) return d;
            Array a = value as Array;
            if (a == null) return null;
            double[] result = new double[a.Length];
            for (int i = 0; i < a.Length; i++) result[i] = Convert.ToDouble(a.GetValue(i), CultureInfo.InvariantCulture);
            return result;
        }

        private static double[] Ensure3(double[] a)
        {
            if (a == null) return new double[] { 0, 0, 0 };
            if (a.Length >= 3) return new double[] { a[0], a[1], a[2] };
            if (a.Length == 2) return new double[] { a[0], a[1], 0 };
            if (a.Length == 1) return new double[] { a[0], 0, 0 };
            return new double[] { 0, 0, 0 };
        }

        private static string BuildNoteName(byte[] pid, double[] attachOffset)
        {
            string hex = BytesToHex(pid);
            long ax = (long)Math.Round(attachOffset[0] * 1000000.0);
            long ay = (long)Math.Round(attachOffset[1] * 1000000.0);
            long az = (long)Math.Round(attachOffset[2] * 1000000.0);
            return NotePrefix + hex + "_" + ax.ToString(CultureInfo.InvariantCulture) + "_" +
                   ay.ToString(CultureInfo.InvariantCulture) + "_" + az.ToString(CultureInfo.InvariantCulture);
        }

        private static string BytesToHex(byte[] bytes)
        {
            if (bytes == null) return string.Empty;
            char[] c = new char[bytes.Length * 2];
            const string h = "0123456789ABCDEF";
            for (int i = 0; i < bytes.Length; i++)
            {
                c[i * 2] = h[bytes[i] >> 4];
                c[i * 2 + 1] = h[bytes[i] & 15];
            }
            return new string(c);
        }

        private static double Distance2(double x1, double y1, double x2, double y2)
        {
            double dx = x1 - x2;
            double dy = y1 - y2;
            return Math.Sqrt(dx * dx + dy * dy);
        }

        private static string LogPath
        {
            get
            {
                string dir = Path.Combine(System.Environment.GetFolderPath(System.Environment.SpecialFolder.LocalApplicationData), "Tooldur", "CriticalK");
                try { Directory.CreateDirectory(dir); } catch { }
                return Path.Combine(dir, "CriticalKRuntime.log");
            }
        }

        private static void Log(string text)
        {
            try { File.AppendAllText(LogPath, DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff", CultureInfo.InvariantCulture) + " | " + text + System.Environment.NewLine); } catch { }
        }

        private static void Show(string text)
        {
            try { MessageBox.Show(text, "Critical K", MessageBoxButtons.OK, MessageBoxIcon.Information); } catch { }
        }

        private sealed class HotKeyWindow : NativeWindow, IDisposable
        {
            private const int WM_HOTKEY = 0x0312;
            private const int HotKeyId = 0x4B25;
            private const uint ModShift = 0x0004;
            private const uint ModNoRepeat = 0x4000;
            private const uint VkX = 0x58;
            private readonly Action action;
            private bool registered;

            public HotKeyWindow(Action action)
            {
                this.action = action;
                CreateParams cp = new CreateParams();
                cp.Caption = "Tooldur Critical K PDM Runtime";
                CreateHandle(cp);
            }

            public void SetEnabled(bool enabled)
            {
                if (enabled == registered) return;
                if (enabled)
                {
                    bool ok = RegisterHotKey(Handle, HotKeyId, ModShift | ModNoRepeat, VkX);
                    if (!ok) ok = RegisterHotKey(Handle, HotKeyId, ModShift, VkX);
                    registered = ok;
                    if (!ok) Log("RegisterHotKey Shift+X FAILED: " + Marshal.GetLastWin32Error());
                }
                else if (registered)
                {
                    UnregisterHotKey(Handle, HotKeyId);
                    registered = false;
                }
            }

            protected override void WndProc(ref Message m)
            {
                if (m.Msg == WM_HOTKEY && m.WParam.ToInt32() == HotKeyId)
                {
                    if (action != null) action();
                    m.Result = IntPtr.Zero;
                    return;
                }
                base.WndProc(ref m);
            }

            public void Dispose()
            {
                try { if (registered) UnregisterHotKey(Handle, HotKeyId); } catch { }
                try { DestroyHandle(); } catch { }
            }
        }

        [DllImport("ole32.dll")]
        private static extern int CreateBindCtx(uint reserved, out IBindCtx ppbc);
        [DllImport("user32.dll")]
        private static extern IntPtr GetForegroundWindow();
        [DllImport("user32.dll")]
        private static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
        [DllImport("user32.dll", SetLastError = true)]
        private static extern bool RegisterHotKey(IntPtr hWnd, int id, uint fsModifiers, uint vk);
        [DllImport("user32.dll", SetLastError = true)]
        private static extern bool UnregisterHotKey(IntPtr hWnd, int id);
    }
}
