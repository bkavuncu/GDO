:: This goes through all GDO.Apps directories and copy GDO.Apps.X.dll in bin folders to GDO\bin folder to be picked up by Assembly locator and copies app folders to main project
@ECHO OFF
SETLOCAL ENABLEDELAYEDEXPANSION

for /D %%a in (GDO.Apps.*) do (
	set str=%%a
    echo Importing !str:GDO.Apps.=!
	mkdir "%cd%\GDO\Configurations\"!str:GDO.Apps.=!
	mkdir "%cd%\GDO\Scripts\"!str:GDO.Apps.=!
	mkdir "%cd%\GDO\Web\"!str:GDO.Apps.=!
	copy "%cd%\%%a\bin\%%a.*" "%cd%\GDO\bin\%%a.*"
	echo a | xcopy /E "%cd%\%%a\Configurations\"!str:GDO.Apps.=! "%cd%\GDO\Configurations\"!str:GDO.Apps.=!\
	echo a | xcopy /E "%cd%\%%a\Scripts\"!str:GDO.Apps.=! "%cd%\GDO\Scripts\"!str:GDO.Apps.=!\
	echo a | xcopy /E "%cd%\%%a\Web\"!str:GDO.Apps.=! "%cd%\GDO\Web\"!str:GDO.Apps.=!\
)
