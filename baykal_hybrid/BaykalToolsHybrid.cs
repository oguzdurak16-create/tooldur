using System;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using Microsoft.Win32;
using EPDM.Interop.epdm;
using SolidWorks.Interop.sldworks;
using SolidWorks.Interop.swpublished;
using SolidWorks.Interop.swconst;

[assembly: AssemblyTitle("BAYKAL Tools PDM + SOLIDWORKS 2024")]
[assembly: AssemblyCompany("Tooldur")]
[assembly: AssemblyVersion("1.0.0.0")]
[assembly: AssemblyFileVersion("1.0.0.0")]
[assembly: ComVisible(true)]

namespace Tooldur.BaykalToolsHybrid
{
    [Guid("C42E86F0-17EC-4A89-A7B1-3E9724A73D11")]
    [ComVisible(true)]
    [ClassInterface(ClassInterfaceType.None)]
    public sealed class BaykalToolsAddin : IEdmAddIn5, ISwAddin
    {
        private const string AddinGuid = "{C42E86F0-17EC-4A89-A7B1-3E9724A73D11}";
        private const int CommandGroupId = 87410;
        private const int DrawingDocType = (int)swDocumentTypes_e.swDocDRAWING;
        private const string TabTitle = "BAYKAL";

        private ISldWorks _swApp;
        private ICommandManager _cmdMgr;
        private int _cookie;

        // ---------------- PDM ----------------
        public void GetAddInInfo(ref EdmAddInInfo poInfo, IEdmVault5 poVault, IEdmCmdMgr5 poCmdMgr)
        {
            poInfo.mbsAddInName = "BAYKAL Tools - SOLIDWORKS";
            poInfo.mbsCompany = "Tooldur";
            poInfo.mbsDescription = "Critical K'dan bagimsiz BAYKAL SOLIDWORKS sekmesi. Tek DLL.";
            poInfo.mlAddInVersion = 100;
            poInfo.mlRequiredVersionMajor = 10;
            poInfo.mlRequiredVersionMinor = 0;

            try { poCmdMgr.AddHook(EdmCmdType.EdmCmd_PreExploreInit); } catch { }
            try { poCmdMgr.AddHook(EdmCmdType.EdmCmd_InstallAddIn); } catch { }

            EnsureSolidWorksRegistry();
            Log("PDM GetAddInInfo process=" + SafeProcessName());
        }

        public void OnCmd(ref EdmCmd poCmd, ref EdmCmdData[] ppoData)
        {
            EnsureSolidWorksRegistry();
            Log("PDM OnCmd " + poCmd.meCmdType + " process=" + SafeProcessName());
        }

        // ---------------- SOLIDWORKS ----------------
        public bool ConnectToSW(object ThisSW, int Cookie)
        {
            try
            {
                _swApp = (ISldWorks)ThisSW;
                _cookie = Cookie;

                bool callbackOk = _swApp.SetAddinCallbackInfo2(0, this, _cookie);
                Log("SW ConnectToSW callback=" + callbackOk + " cookie=" + Cookie);
                if (!callbackOk) return false;

                _cmdMgr = _swApp.GetCommandManager(_cookie);
                if (_cmdMgr == null)
                {
                    Log("SW GetCommandManager NULL");
                    return false;
                }

                BuildCommandManager();
                Log("SW BAYKAL READY");
                return true;
            }
            catch (Exception ex)
            {
                Log("SW ConnectToSW ERROR: " + ex);
                return false;
            }
        }

        public bool DisconnectFromSW()
        {
            try
            {
                _cmdMgr = null;
                _swApp = null;
            }
            catch { }
            return true;
        }

        private void BuildCommandManager()
        {
            int errors = 0;
            CommandGroup group = _cmdMgr.CreateCommandGroup2(
                CommandGroupId,
                TabTitle,
                "BAYKAL SOLIDWORKS araclari",
                "BAYKAL SOLIDWORKS araclari",
                -1,
                true,
                ref errors);

            int itemType = (int)(swCommandItemType_e.swToolbarItem | swCommandItemType_e.swMenuItem);
            int cmdIndex = group.AddCommandItem2(
                "Kritik K",
                -1,
                "Secili olcu, geometrik tolerans veya not icin mevcut Critical K Shift+X komutunu calistirir",
                "Kritik K",
                0,
                nameof(OnCriticalK),
                nameof(EnableCriticalK),
                1,
                itemType);

            group.HasToolbar = true;
            group.HasMenu = true;
            group.Activate();

            int commandId = group.CommandID[cmdIndex];
            CommandTab oldTab = _cmdMgr.GetCommandTab(DrawingDocType, TabTitle);
            if (oldTab != null)
            {
                try { _cmdMgr.RemoveCommandTab(oldTab); } catch { }
            }

            CommandTab tab = _cmdMgr.AddCommandTab(DrawingDocType, TabTitle);
            if (tab == null) throw new InvalidOperationException("AddCommandTab NULL");

            CommandTabBox box = tab.AddCommandTabBox();
            if (box == null) throw new InvalidOperationException("AddCommandTabBox NULL");

            int[] commandIds = { commandId };
            int[] textStyles = { (int)swCommandTabButtonTextDisplay_e.swCommandTabButton_TextBelow };
            bool ok = box.AddCommands(commandIds, textStyles);
            Log("SW AddCommands=" + ok + " commandId=" + commandId + " errors=" + errors);
        }

        public void OnCriticalK()
        {
            SendShiftX();
        }

        public int EnableCriticalK()
        {
            try
            {
                IModelDoc2 doc = _swApp?.ActiveDoc as IModelDoc2;
                return doc != null && doc.GetType() == DrawingDocType ? 1 : 0;
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

        // PDM COM kaydini zaten yapar. Burada ayni CLSID'yi SOLIDWORKS Add-In listesine tanitiriz.
        [ComRegisterFunction]
        public static void RegisterFunction(Type t)
        {
            EnsureSolidWorksRegistry();
        }

        [ComUnregisterFunction]
        public static void UnregisterFunction(Type t)
        {
            try
            {
                using (RegistryKey hklm = RegistryKey.OpenBaseKey(RegistryHive.LocalMachine, RegistryView.Registry64))
                {
                    try { hklm.DeleteSubKeyTree(@"SOFTWARE\SolidWorks\Addins\" + AddinGuid, false); } catch { }
                }
                try { Registry.CurrentUser.DeleteSubKeyTree(@"Software\SolidWorks\AddInsStartup\" + AddinGuid, false); } catch { }
            }
            catch { }
        }

        private static void EnsureSolidWorksRegistry()
        {
            try
            {
                using (RegistryKey hklm = RegistryKey.OpenBaseKey(RegistryHive.LocalMachine, RegistryView.Registry64))
                using (RegistryKey key = hklm.CreateSubKey(@"SOFTWARE\SolidWorks\Addins\" + AddinGuid))
                {
                    if (key != null)
                    {
                        key.SetValue(null, 0, RegistryValueKind.DWord);
                        key.SetValue("Title", "BAYKAL", RegistryValueKind.String);
                        key.SetValue("Description", "BAYKAL SOLIDWORKS araclari", RegistryValueKind.String);
                    }
                }
                Log("SW HKLM registry OK");
            }
            catch (Exception ex)
            {
                Log("SW HKLM registry ERROR: " + ex.GetType().Name + " | " + ex.Message);
            }

            try
            {
                using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\SolidWorks\AddInsStartup\" + AddinGuid))
                {
                    if (key != null) key.SetValue(null, 1, RegistryValueKind.DWord);
                }
                Log("SW HKCU startup OK");
            }
            catch (Exception ex)
            {
                Log("SW HKCU startup ERROR: " + ex.GetType().Name + " | " + ex.Message);
            }
        }

        private static string SafeProcessName()
        {
            try { return Process.GetCurrentProcess().ProcessName; } catch { return "?"; }
        }

        private static string LogPath
        {
            get
            {
                string dir = Path.Combine(System.Environment.GetFolderPath(System.Environment.SpecialFolder.LocalApplicationData), "Tooldur", "BaykalTools");
                try { Directory.CreateDirectory(dir); } catch { }
                return Path.Combine(dir, "BaykalHybrid.log");
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
