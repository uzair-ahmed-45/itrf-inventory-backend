' ================================================
' Inventory ITRF Backend - Hidden Startup Script
' ================================================
' This VBS script starts the backend without showing a console window
' Use this with Windows Task Scheduler for silent startup
' ================================================

Set objShell = CreateObject("WScript.Shell")

' Get the directory where this script is located
strScriptPath = Replace(WScript.ScriptFullName, WScript.ScriptName, "")

' Change to the backend directory and run the batch file
' Run hidden (0 = hidden window, True = wait for completion is False for background)
objShell.Run """" & strScriptPath & "start-backend.bat""", 0, False

Set objShell = Nothing

