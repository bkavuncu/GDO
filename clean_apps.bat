:: This goes through all GDO.Apps directories and copy GDO.Apps.X.dll in bin folders to GDO\apps\ folder to be picked up by Assembly locator
@ECHO OFF
SETLOCAL ENABLEDELAYEDEXPANSION

for /D %%a in (GDO.Apps.*) do (
	set str=%%a
    echo Removing !str:GDO.Apps.=!
    del "%cd%\GDO\bin\%%a.dll"
	rmdir "%cd%\GDO\Configurations\"!str:GDO.Apps.=! /S
	rmdir "%cd%\GDO\Scripts\"!str:GDO.Apps.=! /S
	rmdir "%cd%\GDO\Web\"!str:GDO.Apps.=! /S
)
