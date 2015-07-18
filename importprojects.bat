:: This goes through all GDO.Apps directories and copy GDO.Apps.X.dll in bin folders to GDO\bin\ folder to be picked up by Assembly locator
:: Copies Script and Web folders into IIS path

for /D %%a in (GDO.Apps.*) do copy "%cd%\%%a\bin\%%a.dll" "%cd%\GDO\bin\%%a.dll"
for /D %%a in (GDO.Apps.*) do xcopy /E "%cd%\%%a\bin\Scripts" "%cd%\GDO\Scripts" 
for /D %%a in (GDO.Apps.*) do xcopy /E "%cd%\%%a\bin\Web" "%cd%\GDO\Web" 