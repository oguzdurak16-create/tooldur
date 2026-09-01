using System;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using Microsoft.Win32;
using EPDM.Interop.epdm;

[assembly: AssemblyTitle("Tooldur Critical K PDM Bootstrap")]
[assembly: AssemblyCompany("Tooldur")]
[assembly: AssemblyVersion("1.6.0.0")]
[assembly: AssemblyFileVersion("1.6.0.0")]

namespace Tooldur.CriticalKPdm
{
    [Guid("5A31439E-78BA-4E68-93EF-44B99B1F41A2")]
    [ComVisible(true)]
    [ClassInterface(ClassInterfaceType.None)]
    public class CriticalKPdmAddin : IEdmAddIn5
    {
        private const string AddinName = "Critical K - Merkezi Dagitim";
        private const string RuntimeFile = "CriticalKRuntime.exe";
        private const string SwInteropFile = "SolidWorks.Interop.sldworks.dll";
        private const string SwToolbarFile = "CriticalK_SW2024_BAYKAL.dll";
        private const string RunValueName = "Tooldur Critical K";

        public void GetAddInInfo(ref EdmAddInInfo poInfo, IEdmVault5 poVault, IEdmCmdMgr5 poCmdMgr)
        {
            poInfo.mbsAddInName = AddinName;
            poInfo.mbsCompany = "Tooldur";
            poInfo.mbsDescription = "SOLIDWORKS 2024 Critical K + BAYKAL CommandManager sekmesini PDM uzerinden otomatik dagitir. v1.6.";
            poInfo.mlAddInVersion = 160;
            poInfo.mlRequiredVersionMajor = 10;
            poInfo.mlRequiredVersionMinor = 0;

            try { poCmdMgr.AddHook(EdmCmdType.EdmCmd_PreExploreInit); } catch { }
            try { poCmdMgr.AddHook(EdmCmdType.EdmCmd_InstallAddIn); } catch { }
            try { poCmdMgr.AddHook(EdmCmdType.EdmCmd_UninstallAddIn); } catch { }

            Log("GetAddInInfo process=" + SafeProcessName() + " session=" + SafeSessionId());
            if (CanDeployForCurrentUser()) EnsureRuntime();
        }

        public void OnCmd(ref EdmCmd poCmd, ref EdmCmdData[] ppoData)
        {
            try
            {
                if (poCmd.meCmdType == EdmCmdType.EdmCmd_UninstallAddIn)
                {
                    RemoveRuntimeForCurrentUser();
                    return;
                }

                Log("OnCmd " + poCmd.meCmdType + " process=" + SafeProcessName() + " session=" + SafeSessionId());
                if (poCmd.meCmdType == EdmCmdType.EdmCmd_PreExploreInit || poCmd.meCmdType == EdmCmdType.EdmCmd_InstallAddIn)
                {
                    if (CanDeployForCurrentUser()) EnsureRuntime();
                }
            }
            catch (Exception ex) { Log("OnCmd ERROR: " + ex); }
        }

        private static bool CanDeployForCurrentUser()
        {
            try
            {
                if (Process.GetCurrentProcess().SessionId <= 0) return false;
                string u = System.Environment.UserName ?? "";
                if (string.Equals(u, "SYSTEM", StringComparison.OrdinalIgnoreCase)) return false;
                return true;
            }
            catch { return false; }
        }

        private static string SafeProcessName()
        {
            try { return Process.GetCurrentProcess().ProcessName; } catch { return "?"; }
        }

        private static int SafeSessionId()
        {
            try { return Process.GetCurrentProcess().SessionId; } catch { return -1; }
        }

        private static void EnsureRuntime()
        {
            try
            {
                string dir = RuntimeDir;
                Directory.CreateDirectory(dir);
                string target = Path.Combine(dir, RuntimeFile);
                string swInteropTarget = Path.Combine(dir, SwInteropFile);
                string swToolbarTarget = Path.Combine(dir, SwToolbarFile);

                byte[] embedded = ReadEmbeddedResource(RuntimeFile);
                byte[] embeddedSwInterop = ReadEmbeddedResource(SwInteropFile);
                byte[] embeddedSwToolbar = ReadEmbeddedResource(SwToolbarFile);
                if (embedded == null || embedded.Length == 0) { Log("Embedded runtime bulunamadi."); return; }
                if (embeddedSwInterop == null || embeddedSwInterop.Length == 0) { Log("Embedded SolidWorks.Interop.sldworks.dll bulunamadi."); return; }
                if (embeddedSwToolbar == null || embeddedSwToolbar.Length == 0) { Log("Embedded BAYKAL toolbar DLL bulunamadi."); return; }

                bool needsWrite = NeedsWrite(target, embedded);
                bool interopNeedsWrite = NeedsWrite(swInteropTarget, embeddedSwInterop);
                bool toolbarNeedsWrite = NeedsWrite(swToolbarTarget, embeddedSwToolbar);

                if (needsWrite || interopNeedsWrite || toolbarNeedsWrite)
                {
                    StopRuntimeInThisSession();
                    if (needsWrite) { File.WriteAllBytes(target, embedded); Log("Runtime guncellendi: " + target); }
                    if (interopNeedsWrite) { File.WriteAllBytes(swInteropTarget, embeddedSwInterop); Log("SW interop guncellendi: " + swInteropTarget); }
                    if (toolbarNeedsWrite) { File.WriteAllBytes(swToolbarTarget, embeddedSwToolbar); Log("BAYKAL toolbar DLL guncellendi: " + swToolbarTarget); }
                }

                using (RegistryKey run = Registry.CurrentUser.CreateSubKey("Software\\Microsoft\\Windows\\CurrentVersion\\Run"))
                {
                    if (run != null) run.SetValue(RunValueName, "\"" + target + "\"", RegistryValueKind.String);
                }

                if (!IsRuntimeRunningInThisSession())
                {
                    ProcessStartInfo psi = new ProcessStartInfo(target) { UseShellExecute = false, WorkingDirectory = dir };
                    Process.Start(psi);
                    Log("Runtime baslatildi.");
                }
            }
            catch (Exception ex) { Log("EnsureRuntime ERROR: " + ex); }
        }

        private static bool NeedsWrite(string path, byte[] embedded)
        {
            if (!File.Exists(path)) return true;
            try { return !SameHash(File.ReadAllBytes(path), embedded); } catch { return true; }
        }

        private static void RemoveRuntimeForCurrentUser()
        {
            try
            {
                StopRuntimeInThisSession();
                using (RegistryKey run = Registry.CurrentUser.OpenSubKey("Software\\Microsoft\\Windows\\CurrentVersion\\Run", true))
                {
                    if (run != null) { try { run.DeleteValue(RunValueName, false); } catch { } }
                }
                try { File.Delete(Path.Combine(RuntimeDir, RuntimeFile)); } catch { }
                Log("Runtime kaldirildi.");
            }
            catch (Exception ex) { Log("RemoveRuntime ERROR: " + ex); }
        }

        private static byte[] ReadEmbeddedResource(string resourceName)
        {
            Assembly a = Assembly.GetExecutingAssembly();
            using (Stream s = a.GetManifestResourceStream(resourceName))
            {
                if (s == null) return null;
                using (MemoryStream ms = new MemoryStream()) { s.CopyTo(ms); return ms.ToArray(); }
            }
        }

        private static bool SameHash(byte[] a, byte[] b)
        {
            using (SHA256 sha = SHA256.Create())
            {
                byte[] ha = sha.ComputeHash(a);
                byte[] hb = sha.ComputeHash(b);
                if (ha.Length != hb.Length) return false;
                for (int i = 0; i < ha.Length; i++) if (ha[i] != hb[i]) return false;
                return true;
            }
        }

        private static bool IsRuntimeRunningInThisSession()
        {
            try
            {
                int session = Process.GetCurrentProcess().SessionId;
                foreach (Process p in Process.GetProcessesByName("CriticalKRuntime"))
                {
                    try { if (p.SessionId == session) return true; } catch { }
                }
            }
            catch { }
            return false;
        }

        private static void StopRuntimeInThisSession()
        {
            try
            {
                int session = Process.GetCurrentProcess().SessionId;
                foreach (Process p in Process.GetProcessesByName("CriticalKRuntime"))
                {
                    try
                    {
                        if (p.SessionId != session) continue;
                        p.Kill();
                        p.WaitForExit(3000);
                    }
                    catch { }
                }
            }
            catch { }
        }

        private static string RuntimeDir => Path.Combine(System.Environment.GetFolderPath(System.Environment.SpecialFolder.LocalApplicationData), "Tooldur", "CriticalK");
        private static string LogPath
        {
            get
            {
                string d = RuntimeDir;
                try { Directory.CreateDirectory(d); } catch { }
                return Path.Combine(d, "CriticalKPdmDeploy.log");
            }
        }

        private static void Log(string text)
        {
            try { File.AppendAllText(LogPath, DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff", CultureInfo.InvariantCulture) + " | " + text + System.Environment.NewLine); } catch { }
        }
    }
}
