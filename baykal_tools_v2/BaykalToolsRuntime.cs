using System;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Runtime.InteropServices.ComTypes;
using System.Windows.Forms;
using SolidWorks.Interop.sldworks;
using SolidWorks.Interop.swconst;

[assembly: AssemblyTitle("BAYKAL Tools Runtime")]
[assembly: AssemblyCompany("Tooldur")]
[assembly: AssemblyVersion("1.1.0.0")]
[assembly: AssemblyFileVersion("1.1.0.0")]

namespace Tooldur.BaykalToolsRuntime
{
    internal static class Program
    {
        [STAThread]
        private static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            RuntimeHost.Start();
            Application.Run();
        }
    }

    internal static class RuntimeHost
    {
        private const int Cookie = 87331;
        private const int CommandGroupId = 87332;
        private const int DrawingDocType = (int)swDocumentTypes_e.swDocDRAWING;
        private const string TabTitle = "BAYKAL";

        private static readonly Timer Timer = new Timer { Interval = 1000 };
        private static ISldWorks _sw;
        private static ICommandManager _cmdMgr;
        private static CommandGroup _group;
        private static BaykalCallback _callback;
        private static int _attachedPid;
        private static bool _uiReady;
        private static DateTime _lastAttempt = DateTime.MinValue;

        public static void Start()
        {
            Log("Runtime START v1.1.0 - separate BAYKAL tools");
            Timer.Tick += OnTick;
            Timer.Start();
            OnTick(null, EventArgs.Empty);
        }

        private static void OnTick(object sender, EventArgs e)
        {
            try
            {
                if (!TryGetForegroundSolidWorksPid(out int pid)) return;

                if (_uiReady && pid == _attachedPid) return;
                if ((DateTime.Now - _lastAttempt).TotalMilliseconds < 800) return;
                _lastAttempt = DateTime.Now;

                ResetConnection();
                ISldWorks sw = TryGetSolidWorksByPid(pid);
                if (sw == null)
                {
                    Log("ROT attach FAILED pid=" + pid);
                    return;
                }

                _sw = sw;
                _attachedPid = pid;
                _callback = new BaykalCallback(_sw);

                bool callbackOk = false;
                try { callbackOk = _sw.SetAddinCallbackInfo2(0, _callback, Cookie); }
                catch (Exception ex) { Log("SetAddinCallbackInfo2 ERROR: " + ex.Message); }
                Log("SetAddinCallbackInfo2=" + callbackOk + " pid=" + pid);

                try { _cmdMgr = _sw.GetCommandManager(Cookie); }
                catch (Exception ex) { Log("GetCommandManager ERROR: " + ex.Message); }

                if (_cmdMgr == null)
                {
                    Log("GetCommandManager NULL");
                    return;
                }

                BuildToolbar();
                _uiReady = true;
                Log("BAYKAL toolbar READY pid=" + pid);
            }
            catch (Exception ex)
            {
                Log("Tick ERROR: " + ex);
            }
        }

        private static void ResetConnection()
        {
            _uiReady = false;
            _group = null;
            _cmdMgr = null;
            _callback = null;
            _sw = null;
            _attachedPid = 0;
        }

        private static void BuildToolbar()
        {
            int errors = 0;
            _group = _cmdMgr.CreateCommandGroup2(
                CommandGroupId,
                "BAYKAL",
                "BAYKAL SOLIDWORKS araçları",
                "BAYKAL SOLIDWORKS araçları",
                -1,
                true,
                ref errors);

            if (_group == null)
            {
                Log("CreateCommandGroup2 NULL errors=" + errors);
                return;
            }

            int itemType = (int)(swCommandItemType_e.swToolbarItem | swCommandItemType_e.swMenuItem);
            int cmdIndex = _group.AddCommandItem2(
                "Kritik K",
                -1,
                "Seçili ölçü, geometrik tolerans veya nota mevcut Critical K ile kritik işareti ekler",
                "Kritik K",
                0,
                nameof(BaykalCallback.OnCriticalK),
                nameof(BaykalCallback.EnableCriticalK),
                1,
                itemType);

            _group.HasToolbar = true;
            _group.HasMenu = true;
            _group.Activate();

            int commandId = _group.CommandID[cmdIndex];

            try
            {
                CommandTab oldTab = _cmdMgr.GetCommandTab(DrawingDocType, TabTitle);
                if (oldTab != null) _cmdMgr.RemoveCommandTab(oldTab);
            }
            catch (Exception ex) { Log("Remove old tab ERROR: " + ex.Message); }

            CommandTab tab = _cmdMgr.AddCommandTab(DrawingDocType, TabTitle);
            if (tab == null)
            {
                Log("AddCommandTab NULL");
                return;
            }

            CommandTabBox box = tab.AddCommandTabBox();
            if (box == null)
            {
                Log("AddCommandTabBox NULL");
                return;
            }

            int[] commandIds = { commandId };
            int[] textStyles = { (int)swCommandTabButtonTextDisplay_e.swCommandTabButton_TextBelow };
            bool ok = box.AddCommands(commandIds, textStyles);
            Log("AddCommands=" + ok + " commandId=" + commandId + " groupErrors=" + errors);
        }

        private static bool TryGetForegroundSolidWorksPid(out int pid)
        {
            pid = 0;
            try
            {
                IntPtr hwnd = GetForegroundWindow();
                if (hwnd == IntPtr.Zero) return false;
                GetWindowThreadProcessId(hwnd, out uint rawPid);
                if (rawPid == 0) return false;
                Process p = Process.GetProcessById((int)rawPid);
                if (!string.Equals(p.ProcessName, "SLDWORKS", StringComparison.OrdinalIgnoreCase)) return false;
                pid = (int)rawPid;
                return true;
            }
            catch { return false; }
        }

        private static ISldWorks TryGetSolidWorksByPid(int pid)
        {
            IBindCtx bindCtx = null;
            IRunningObjectTable rot = null;
            IEnumMoniker enumMoniker = null;
            try
            {
                CreateBindCtx(0, out bindCtx);
                bindCtx.GetRunningObjectTable(out rot);
                rot.EnumRunning(out enumMoniker);
                enumMoniker.Reset();

                string expected = "SolidWorks_PID_" + pid.ToString(CultureInfo.InvariantCulture);
                IMoniker[] monikers = new IMoniker[1];
                IntPtr fetched = IntPtr.Zero;

                while (enumMoniker.Next(1, monikers, fetched) == 0)
                {
                    IMoniker moniker = monikers[0];
                    string name = null;
                    try { moniker.GetDisplayName(bindCtx, null, out name); } catch { }
                    if (!string.Equals(name, expected, StringComparison.OrdinalIgnoreCase)) continue;

                    object obj = null;
                    try { rot.GetObject(moniker, out obj); } catch (Exception ex) { Log("ROT GetObject ERROR: " + ex.Message); }
                    ISldWorks sw = obj as ISldWorks;
                    if (sw == null) return null;

                    try
                    {
                        int actualPid = sw.GetProcessID();
                        if (actualPid != pid)
                        {
                            Log("ROT PID mismatch expected=" + pid + " actual=" + actualPid);
                            return null;
                        }
                    }
                    catch (Exception ex) { Log("GetProcessID ERROR: " + ex.Message); }

                    return sw;
                }
            }
            catch (Exception ex)
            {
                Log("TryGetSolidWorksByPid ERROR: " + ex);
            }
            finally
            {
                if (enumMoniker != null && Marshal.IsComObject(enumMoniker)) try { Marshal.ReleaseComObject(enumMoniker); } catch { }
                if (rot != null && Marshal.IsComObject(rot)) try { Marshal.ReleaseComObject(rot); } catch { }
                if (bindCtx != null && Marshal.IsComObject(bindCtx)) try { Marshal.ReleaseComObject(bindCtx); } catch { }
            }
            return null;
        }

        private static string LogPath
        {
            get
            {
                string dir = Path.Combine(System.Environment.GetFolderPath(System.Environment.SpecialFolder.LocalApplicationData), "Tooldur", "BaykalTools");
                try { Directory.CreateDirectory(dir); } catch { }
                return Path.Combine(dir, "BaykalToolsRuntime.log");
            }
        }

        internal static void Log(string text)
        {
            try
            {
                File.AppendAllText(LogPath, DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff", CultureInfo.InvariantCulture) + " | " + text + System.Environment.NewLine);
            }
            catch { }
        }

        [DllImport("user32.dll")]
        private static extern IntPtr GetForegroundWindow();

        [DllImport("user32.dll")]
        private static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

        [DllImport("ole32.dll")]
        private static extern int CreateBindCtx(uint reserved, out IBindCtx ppbc);
    }

    [ComVisible(true)]
    [ClassInterface(ClassInterfaceType.AutoDispatch)]
    public sealed class BaykalCallback
    {
        private readonly ISldWorks _sw;

        public BaykalCallback(ISldWorks sw)
        {
            _sw = sw;
        }

        public void OnCriticalK()
        {
            try
            {
                SendShiftX();
                RuntimeHost.Log("Kritik K button -> Shift+X");
            }
            catch (Exception ex) { RuntimeHost.Log("OnCriticalK ERROR: " + ex.Message); }
        }

        public int EnableCriticalK()
        {
            try
            {
                IModelDoc2 doc = _sw?.ActiveDoc as IModelDoc2;
                return doc != null && doc.GetType() == (int)swDocumentTypes_e.swDocDRAWING ? 1 : 0;
            }
            catch { return 0; }
        }

        private static void SendShiftX()
        {
            const byte VK_SHIFT = 0x10;
            const byte VK_X = 0x58;
            const uint KEYEVENTF_KEYUP = 0x0002;
            keybd_event(VK_SHIFT, 0, 0, UIntPtr.Zero);
            keybd_event(VK_X, 0, 0, UIntPtr.Zero);
            keybd_event(VK_X, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
            keybd_event(VK_SHIFT, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        }

        [DllImport("user32.dll")]
        private static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);
    }
}
