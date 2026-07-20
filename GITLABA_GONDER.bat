@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"

title Tooldur Runtime Duzeltmesi - GitLab'a Gonder

echo ================================================
echo   TOOLDUR RUNTIME DUZELTMESINI GITLAB'A GONDER
echo ================================================
echo.

where git >nul 2>&1
if errorlevel 1 (
    echo HATA: Git bulunamadi.
    echo Once Git for Windows kurulmali.
    pause
    exit /b 1
)

if not exist ".git" (
    echo Git klasoru hazirlaniyor...
    git init
    if errorlevel 1 goto :error

    git remote add origin https://gitlab.com/oguzdurak16/tooldur.git 2>nul
    git remote set-url origin https://gitlab.com/oguzdurak16/tooldur.git

    echo GitLab ana dali aliniyor...
    git fetch origin main
    if errorlevel 1 goto :error

    rem Uzak main gecmisini koru, mevcut dosyalari onun uzerine degisiklik olarak hazirla.
    git reset origin/main
    if errorlevel 1 goto :error
    git branch -M main
) else (
    echo Mevcut Git deposu bulundu.
    git remote get-url origin >nul 2>&1
    if errorlevel 1 (
        git remote add origin https://gitlab.com/oguzdurak16/tooldur.git
    ) else (
        git remote set-url origin https://gitlab.com/oguzdurak16/tooldur.git
    )
    git branch -M main
)

echo.
echo Dosyalar hazirlaniyor...
git add -A
if errorlevel 1 goto :error

git diff --cached --quiet
if errorlevel 1 (
    git commit -m "Fix hydration, missing route, hero asset and CSP"
    if errorlevel 1 goto :error
) else (
    echo Yeni degisiklik bulunamadi; mevcut main dali gonderilecek.
)

echo.
echo GitLab'a gonderiliyor...
git push -u origin main
if errorlevel 1 goto :error

echo.
echo ================================================
echo BASARILI: Dosyalar GitLab main dalina gonderildi.
echo Vercel otomatik deployment baslatacaktir.
echo ================================================
pause
exit /b 0

:error
echo.
echo ================================================
echo HATA: Islem tamamlanamadi.
echo Yukaridaki hata mesajini kopyalayip gonder.
echo ================================================
pause
exit /b 1
