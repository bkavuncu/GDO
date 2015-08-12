:: This removes GDO.Apps.X.dll in bin and app folders from main project
@ECHO OFF
SETLOCAL ENABLEDELAYEDEXPANSION

for /D %%a in (GDO.Apps.*) do (
	set str=%%a
    echo Removing !str:GDO.Apps.=!
    del "%cd%\GDO\bin\*.*"
	echo y | rmdir "%cd%\GDO\Configurations\"!str:GDO.Apps.=! /S
	echo y | rmdir "%cd%\GDO\Scripts\"!str:GDO.Apps.=! /S
	echo y | rmdir "%cd%\GDO\Web\"!str:GDO.Apps.=! /S
)
