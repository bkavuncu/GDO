:: This goes through all GDO.Apps directories and copy GDO.Apps.X.dll in bin folders to GDO\apps\ folder to be picked up by Assembly locator
for /D %%a in (GDO.Apps.*) do copy "%cd%\%%a\bin\%%a.dll" "%cd%\GDO\Apps\%%a.dll"
