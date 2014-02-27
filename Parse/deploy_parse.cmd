@echo off
if exist cloud\main.js goto backup 
:continue
for %%f in (Source\*.js) do type %%f >> cloud\main.js
goto next
:backup
copy cloud\main.js cloud\main.js.bak
del cloud\main.js
goto continue
:next
parse deploy