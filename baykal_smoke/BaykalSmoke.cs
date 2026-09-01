using System;
using System.Reflection;
using System.Runtime.InteropServices;
using EPDM.Interop.epdm;

[assembly: AssemblyTitle("BAYKAL PDM CLEAN TEST")]
[assembly: AssemblyCompany("Tooldur")]
[assembly: AssemblyVersion("1.0.0.0")]
[assembly: AssemblyFileVersion("1.0.0.0")]

namespace Tooldur.BaykalSmoke
{
    [Guid("67CE7E24-811E-48AF-9FA5-C34BFB56A2D7")]
    [ComVisible(true)]
    [ClassInterface(ClassInterfaceType.None)]
    public sealed class BaykalSmokeAddin : IEdmAddIn5
    {
        public void GetAddInInfo(ref EdmAddInInfo poInfo, IEdmVault5 poVault, IEdmCmdMgr5 poCmdMgr)
        {
            poInfo.mbsAddInName = "BAYKAL Tools - CLEAN TEST";
            poInfo.mbsCompany = "Tooldur";
            poInfo.mbsDescription = "Minimal PDM add-in security test. No EXE, no registry write, no hotkey, no P/Invoke.";
            poInfo.mlAddInVersion = 100;
            poInfo.mlRequiredVersionMajor = 10;
            poInfo.mlRequiredVersionMinor = 0;
        }

        public void OnCmd(ref EdmCmd poCmd, ref EdmCmdData[] ppoData)
        {
        }
    }
}
