using System;
using System.Runtime.InteropServices;
using Microsoft.Win32;
using SolidWorks.Interop.sldworks;
using SolidWorks.Interop.swpublished;
using SolidWorks.Interop.swconst;

namespace Tooldur.BaykalSwAddin
{
    [ComVisible(true)]
    [Guid("D678C6E6-5C46-4E22-9A35-A8B1E94E7B01")]
    [ClassInterface(ClassInterfaceType.None)]
    public sealed class SwAddin : ISwAddin
    {
        private const int CommandGroupId = 87310;
        private const int DrawingDocType = (int)swDocumentTypes_e.swDocDRAWING;
        private const string TabTitle = "BAYKAL";

        private ISldWorks _swApp;
        private ICommandManager _cmdMgr;
        private int _cookie;
        private int _criticalKCommandIndex = -1;

        public bool ConnectToSW(object ThisSW, int Cookie)
        {
            try
            {
                _swApp = (ISldWorks)ThisSW;
                _cookie = Cookie;

                if (!_swApp.SetAddinCallbackInfo2(0, this, _cookie))
                    return false;

                _cmdMgr = _swApp.GetCommandManager(_cookie);
                BuildCommandManager();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public bool DisconnectFromSW()
        {
            try
            {
                // SOLIDWORKS, kullanici CommandManager yerlesimini registry'de saklar.
                // Ilk asamada kullanici sekmesini agresif sekilde silmiyoruz.
                _cmdMgr = null;
                _swApp = null;
                return true;
            }
            catch
            {
                return true;
            }
        }

        private void BuildCommandManager()
        {
            int errors = 0;
            ICommandGroup group = _cmdMgr.CreateCommandGroup2(
                CommandGroupId,
                TabTitle,
                "BAYKAL SOLIDWORKS araçları",
                "BAYKAL SOLIDWORKS araçları",
                -1,
                true,
                ref errors);

            int itemType = (int)(swCommandItemType_e.swToolbarItem | swCommandItemType_e.swMenuItem);

            _criticalKCommandIndex = group.AddCommandItem2(
                "Kritik K",
                -1,
                "Seçili ölçü, geometrik tolerans veya nota kritik K ekler",
                "Kritik K",
                0,
                nameof(OnCriticalK),
                nameof(EnableCriticalK),
                1,
                itemType);

            group.HasToolbar = true;
            group.HasMenu = true;
            group.Activate();

            int commandId = group.CommandID[_criticalKCommandIndex];

            ICommandTab oldTab = _cmdMgr.GetCommandTab(DrawingDocType, TabTitle);
            if (oldTab != null)
            {
                try { _cmdMgr.RemoveCommandTab(oldTab); } catch { }
            }

            ICommandTab tab = _cmdMgr.AddCommandTab(DrawingDocType, TabTitle);
            if (tab == null) return;

            ICommandTabBox box = tab.AddCommandTabBox();
            if (box == null) return;

            int[] commandIds = { commandId };
            int[] textStyles = { (int)swCommandTabButtonTextDisplay_e.swCommandTabButton_TextBelow };
            box.AddCommands(commandIds, textStyles);
        }

        // İlk adımda mevcut PDM Runtime davranışını değiştirmiyoruz.
        // Buton sadece mevcut Shift+X hotkey'ini tetikler.
        public void OnCriticalK()
        {
            SendShiftX();
        }

        public int EnableCriticalK()
        {
            try
            {
                if (_swApp == null) return 0;
                IModelDoc2 doc = _swApp.ActiveDoc as IModelDoc2;
                return doc != null && doc.GetType() == DrawingDocType ? 1 : 0;
            }
            catch
            {
                return 0;
            }
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

        [ComRegisterFunction]
        public static void RegisterFunction(Type t)
        {
            string guid = "{" + t.GUID.ToString().ToUpperInvariant() + "}";

            using (RegistryKey addinKey = Registry.LocalMachine.CreateSubKey(@"SOFTWARE\SolidWorks\Addins\" + guid))
            {
                if (addinKey != null)
                {
                    addinKey.SetValue(null, 0, RegistryValueKind.DWord);
                    addinKey.SetValue("Title", "BAYKAL", RegistryValueKind.String);
                    addinKey.SetValue("Description", "BAYKAL SOLIDWORKS araçları", RegistryValueKind.String);
                }
            }

            using (RegistryKey startupKey = Registry.CurrentUser.CreateSubKey(@"Software\SolidWorks\AddInsStartup\" + guid))
            {
                if (startupKey != null)
                    startupKey.SetValue(null, 1, RegistryValueKind.DWord);
            }
        }

        [ComUnregisterFunction]
        public static void UnregisterFunction(Type t)
        {
            string guid = "{" + t.GUID.ToString().ToUpperInvariant() + "}";
            try { Registry.LocalMachine.DeleteSubKeyTree(@"SOFTWARE\SolidWorks\Addins\" + guid, false); } catch { }
            try { Registry.CurrentUser.DeleteSubKeyTree(@"Software\SolidWorks\AddInsStartup\" + guid, false); } catch { }
        }
    }
}
