:: This goes through all GDO.Apps directories and copy GDO.Apps.X.dll in bin folders to GDO\apps\ folder to be picked up by Assembly locator
for /D %%a in (GDO.Apps.*) do copy "%cd%\%%a\bin\%%a.dll" "%cd%\GDO\bin\%%a.dll"
for /D %%a in (GDO.Apps.*) do xcopy /E "%cd%\%%a\Scripts" "%cd%\GDO\Scripts" 
for /D %%a in (GDO.Apps.*) do xcopy /E "%cd%\%%a\Web" "%cd%\GDO\Web" 
for /D %%a in (GDO.Apps.*) do xcopy /E "%cd%\%%a\Configurations" "%cd%\GDO\Configurations" 