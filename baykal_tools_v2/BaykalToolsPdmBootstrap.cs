using System;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using Microsoft.Win32;
using EPDM.Interop.epdm;

[assembly: AssemblyTitle("BAYKAL Tools PDM Bootstrap")]
[assembly: AssemblyCompany("Tooldur")]
[assembly: AssemblyVersion("1.1.0.0")]
[assembly: AssemblyFileVersion("1.1.0.0")]

namespace Tooldur.BaykalToolsPdm
{
    [Guid("B81FA970-C51A-45E2-92E4-0E6450E50A66")]
    [ComVisible(true)]
    [ClassInterface(ClassInterfaceType.None)]
    public sealed class BaykalToolsPdmAddin : IEdmAddIn5
    {
        private const string RuntimeFile = "BaykalToolsRuntime.exe";
        private const string SwInteropFile = "SolidWorks.Interop.sldworks.dll";
        private const string SwConstFile = "SolidWorks.Interop.swconst.dll";
        private const string RunValueName = "Tooldur BAYKAL Tools";

        public void GetAddInInfo(ref EdmAddInInfo poInfo, IEdmVault5 poVault, IEdmCmdMgr5 poCmdMgr)
        {
            poInfo.mbsAddInName = "BAYKAL Tools - Merkezi Dagitim";
            poInfo.mbsCompany = "Tooldur";
            poInfo.mbsDescription = "Mevcut Critical K eklentisine dokunmadan BAYKAL SOLIDWORKS araclarini merkezi dagitir. v1.1";
            poInfo.mlAddInVersion = 110;
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
                string user = System.Environment.UserName ?? string.Empty;
                return !string.Equals(user, "SYSTEM", StringComparison.OrdinalIgnoreCase);
            }
            catch { return false; }
        }

        private static void EnsureRuntime()
        {
            try
            {
                Directory.CreateDirectory(RuntimeDir);
                string runtime = Path.Combine(RuntimeDir, RuntimeFile);
                string swInterop = Path.Combine(RuntimeDir, SwInteropFile);
                string swConst = Path.Combine(RuntimeDir, SwConstFile);

                byte[] runtimeBytes = ReadEmbeddedResource(RuntimeFile);
                byte[] swInteropBytes = ReadEmbeddedResource(SwInteropFile);
                byte[] swConstBytes = ReadEmbeddedResource(SwConstFile);

                if (runtimeBytes == null || runtimeBytes.Length == 0) { Log("Embedded runtime bulunamadi."); return; }
                if (swInteropBytes == null || swInteropBytes.Length == 0) { Log("Embedded sldworks interop bulunamadi."); return; }
                if (swConstBytes == null || swConstBytes.Length == 0) { Log("Embedded swconst interop bulunamadi."); return; }

                bool runtimeChanged = NeedsWrite(runtime, runtimeBytes);
                bool swInteropChanged = NeedsWrite(swInterop, swInteropBytes);
                bool swConstChanged = NeedsWrite(swConst, swConstBytes);

                if (runtimeChanged || swInteropChanged || swConstChanged)
                {
                    StopRuntimeInThisSession();
                    if (runtimeChanged) { File.WriteAllBytes(runtime, runtimeBytes); Log("Runtime guncellendi: " + runtime); }
                    if (swInteropChanged) { File.WriteAllBytes(swInterop, swInteropBytes); Log("sldworks interop guncellendi."); }
                    if (swConstChanged) { File.WriteAllBytes(swConst, swConstBytes); Log("swconst interop guncellendi."); }
                }

                using (RegistryKey run = Registry.CurrentUser.CreateSubKey("Software\\Microsoft\\Windows\\CurrentVersion\\Run"))
                {
                    run?.SetValue(RunValueName, "\"" + runtime + "\"", RegistryValueKind.String);
                }

                if (!IsRuntimeRunningInThisSession())
                {
                    Process.Start(new ProcessStartInfo(runtime)
                    {
                        UseShellExecute = false,
                        WorkingDirectory = RuntimeDir
                    });
                    Log("Runtime baslatildi.");
                }
            }
            catch (Exception ex) { Log("EnsureRuntime ERROR: " + ex); }
        }

        private static void RemoveRuntimeForCurrentUser()
        {
            try
            {
                StopRuntimeInThisSession();
                using (RegistryKey run = Registry.CurrentUser.OpenSubKey("Software\\Microsoft\\Windows\\CurrentVersion\\Run", true))
                {
                    try { run?.DeleteValue(RunValueName, false); } catch { }
                }
                Log("Runtime durduruldu ve startup kaldirildi. Critical K etkilenmedi.");
            }
            catch (Exception ex) { Log("RemoveRuntime ERROR: " + ex); }
        }

        private static byte[] ReadEmbeddedResource(string resourceName)
        {
            Assembly a = Assembly.GetExecutingAssembly();
            using (Stream s = a.GetManifestResourceStream(resourceName))
            {
                if (s == null) return null;
                using (MemoryStream ms = new MemoryStream())
                {
                    s.CopyTo(ms);
                    return ms.ToArray();
                }
            }
        }

        private static bool NeedsWrite(string path, byte[] embedded)
        {
            if (!File.Exists(path)) return true;
            try { return !SameHash(File.ReadAllBytes(path), embedded); } catch { return true; }
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
                foreach (Process p in Process.GetProcessesByName("BaykalToolsRuntime"))
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
                foreach (Process p in Process.GetProcessesByName("BaykalToolsRuntime"))
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

        private static string SafeProcessName()
        {
            try { return Process.GetCurrentProcess().ProcessName; } catch { return "?"; }
        }

        private static int SafeSessionId()
        {
            try { return Process.GetCurrentProcess().SessionId; } catch { return -1; }
        }

        private static string RuntimeDir => Path.Combine(System.Environment.GetFolderPath(System.Environment.SpecialFolder.LocalApplicationData), "Tooldur", "BaykalTools");

        private static string LogPath
        {
            get
            {
                try { Directory.CreateDirectory(RuntimeDir); } catch { }
                return Path.Combine(RuntimeDir, "BaykalToolsPdmDeploy.log");
            }
        }

        private static void Log(string text)
        {
            try
            {
                File.AppendAllText(LogPath, DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff", CultureInfo.InvariantCulture) + " | " + text + System.Environment.NewLine);
            }
            catch { }
        }
    }
}
