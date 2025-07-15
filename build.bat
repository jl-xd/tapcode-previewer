@echo off
chcp 65001 >nul
echo =====================================
echo      TapCode Previewer Build Script
echo      (Static Files Only)
echo =====================================
echo.

set DIST_DIR=dist
set SOURCE_DIR=.

echo [1/3] Creating build directory...
if exist "%DIST_DIR%" (
    echo Cleaning old build directory...
    rmdir /s /q "%DIST_DIR%"
)
mkdir "%DIST_DIR%"
echo Success: Build directory created

echo.
echo [2/3] Copying static files...
copy "%SOURCE_DIR%\index.html" "%DIST_DIR%\" >nul
copy "%SOURCE_DIR%\style.css" "%DIST_DIR%\" >nul
copy "%SOURCE_DIR%\script.js" "%DIST_DIR%\" >nul
copy "%SOURCE_DIR%\config.js" "%DIST_DIR%\" >nul
copy "%SOURCE_DIR%\qrcode.html" "%DIST_DIR%\" >nul
echo Success: Static files copied

echo.
echo [3/3] Generating deployment guide...
(
echo # TapCode Previewer - Production Build
echo.
echo ## Files Included
echo - index.html - Main preview page
echo - qrcode.html - QR code generation page  
echo - style.css - Stylesheet
echo - script.js - Main scripts
echo - config.js - Configuration file
echo.
echo ## Deployment
echo Upload all files to your web server root directory and access via your domain.
echo.
echo ## Browser Support
echo Chrome 60+, Safari 12+, Firefox 55+, Edge 79+
echo.
echo Build: %date% %time%
) > "%DIST_DIR%\DEPLOYMENT.md"
echo Success: Deployment guide generated

echo.
echo =====================================
echo         BUILD COMPLETED!
echo =====================================
echo.
echo Build location: %cd%\%DIST_DIR%
echo.
echo Files included:
dir "%DIST_DIR%" /b
echo.
echo Ready for deployment to any web server.
echo.
echo =====================================
pause 