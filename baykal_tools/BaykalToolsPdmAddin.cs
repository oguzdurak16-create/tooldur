using System;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using EPDM.Interop.epdm;
using SolidWorks.Interop.sldworks;
using SolidWorks.Interop.swconst;

[assembly: AssemblyTitle("BAYKAL Tools PDM 2024")]
[assembly: AssemblyCompany("Tooldur")]
[assembly: AssemblyVersion("1.0.0.0")]
[assembly: AssemblyFileVersion("1.0.0.0")]

namespace Tooldur.BaykalTools
{
    [Guid("8E197838-BA33-43C1-A790-7B5FA02A0F41")]
    [ComVisible(true)]
    [ClassInterface(ClassInterfaceType.None)]
    public sealed class BaykalToolsPdmAddin : IEdmAddIn5
    {
        private static ISldWorks _swApp;
        private static ICommandManager _cmdMgr;
        private static BaykalCallback _callback;
        private static bool _uiReady;
        private const int Cookie = 87321;
        private const int CommandGroupId = 87322;
        private const int DrawingDocType = (int)swDocumentTypes_e.swDocDRAWING;
        private const string TabTitle = "BAYKAL";

        public void GetAddInInfo(ref EdmAddInInfo poInfo, IEdmVault5 poVault, IEdmCmdMgr5 poCmdMgr)
        {
            poInfo.mbsAddInName = "BAYKAL Tools - Toolbar";
            poInfo.mbsCompany = "Tooldur";
            poInfo.mbsDescription = "Critical K eklentisinden bagimsiz BAYKAL CommandManager sekmesi. Mevcut Critical K Shift+X komutunu tetikler.";
            poInfo.mlAddInVersion = 100;
            poInfo.mlRequiredVersionMajor = 10;
            poInfo.mlRequiredVersionMinor = 0;

            try { poCmdMgr.AddHook(EdmCmdType.EdmCmd_PreExploreInit); } catch { }
            try { poCmdMgr.AddHook(EdmCmdType.EdmCmd_InstallAddIn); } catch { }

            Log("GetAddInInfo process=" + SafeProcessName());
            TryInitializeInSolidWorks();
        }

        public void OnCmd(ref EdmCmd poCmd, ref EdmCmdData[] ppoData)
        {
            Log("OnCmd " + poCmd.meCmdType + " process=" + SafeProcessName());
            TryInitializeInSolidWorks();
        }

        private static void TryInitializeInSolidWorks()
        {
            if (_uiReady) return;
            if (!string.Equals(SafeProcessName(), "SLDWORKS", StringComparison.OrdinalIgnoreCase)) return;

            try
            {
                object obj = Marshal.GetActiveObject("SldWorks.Application");
                _swApp = obj as ISldWorks;
                if (_swApp == null)
                {
                    Log("ISldWorks bulunamadi.");
                    return;
                }

                _callback = new BaykalCallback(_swApp);
                bool callbackOk = _swApp.SetAddinCallbackInfo2(0, _callback, Cookie);
                Log("SetAddinCallbackInfo2=" + callbackOk);

                _cmdMgr = _swApp.GetCommandManager(Cookie);
                if (_cmdMgr == null)
                {
                    Log("GetCommandManager NULL");
                    return;
                }

                BuildToolbar();
                _uiReady = true;
                Log("BAYKAL toolbar READY");
            }
            catch (Exception ex)
            {
                Log("TryInitializeInSolidWorks ERROR: " + ex);
            }
        }

        private static void BuildToolbar()
        {
            int errors = 0;
            CommandGroup group = _cmdMgr.CreateCommandGroup2(
                CommandGroupId,
                "BAYKAL",
                "BAYKAL SOLIDWORKS araclari",
                "BAYKAL SOLIDWORKS araclari",
                -1,
                true,
                ref errors);

            int itemType = (int)(swCommandItemType_e.swToolbarItem | swCommandItemType_e.swMenuItem);
            int cmdIndex = group.AddCommandItem2(
                "Kritik K",
                -1,
                "Secili olcu, GTOL veya nota mevcut Critical K eklentisiyle K ekler",
                "Kritik K",
                0,
                nameof(BaykalCallback.OnCriticalK),
                nameof(BaykalCallback.EnableCriticalK),
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
            Log("AddCommands=" + ok + " commandId=" + commandId);
        }

        private static string SafeProcessName()
        {
            try { return Process.GetCurrentProcess().ProcessName; } catch { return "?"; }
        }

        private static string LogPath
        {
            get
            {
                string dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Tooldur", "BaykalTools");
                try { Directory.CreateDirectory(dir); } catch { }
                return Path.Combine(dir, "BaykalTools.log");
            }
        }

        private static void Log(string text)
        {
            try
            {
                File.AppendAllText(LogPath, DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff", CultureInfo.InvariantCulture) + " | " + text + Environment.NewLine);
            }
            catch { }
        }
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
            SendShiftX();
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
