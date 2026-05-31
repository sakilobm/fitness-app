@echo off
echo =======================================================
echo   Fitness-App Automated Build Fixer
echo =======================================================
echo.
echo [0/4] Stopping background processes (unlocking files)...
cd android
call gradlew.bat --stop >nul 2>&1
cd ..
taskkill /F /IM java.exe /T >nul 2>&1
echo Done.
echo.
echo [1/4] Deleting corrupted node_modules and package-lock...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /q package-lock.json
echo Done.
echo.
echo [2/4] Reinstalling dependencies (bypassing strict version conflicts)...
call npm install --legacy-peer-deps
echo Done.
echo.
echo [3/4] Cleaning Android build cache...
cd android
call gradlew.bat clean
cd ..
echo Done.
echo.
echo [4/4] Starting Expo Android build...
call npx expo run:android