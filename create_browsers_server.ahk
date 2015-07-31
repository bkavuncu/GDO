; GDO Create Browsers Script

Width := 200
Height := 200
Cols := 2
Rows := 2
URL := "http://localhost:12332/Web/Node.cshtml"
URLParameter :="clientId"
Title := "GDO Test Node "
Node := 1
Step := 16


Gui, Add, Text,, Width per Node:
Gui, Add, Edit, w100 vWidth, 1920
Gui, Add, Text,, Height per Node:
Gui, Add, Edit, w100 vHeight , 1080
Gui, Add, Text,, Cols:
Gui, Add, Edit, w70 vCols , 3
Gui, Add, Text,, Rows:
Gui, Add, Edit, w70 vRows , 4
Gui, Add, Text,, Node to Start from:
Gui, Add, Edit, w70 vNode , 1 
Gui, Add, Text,, Num Colums in Cave row:
Gui, Add, Edit, w70 vStep , 16 
Gui, Add, Text,, Top Left X:
Gui, Add, Edit, w70 vTopLeftX , 0
Gui, Add, Text,, Top Left Y:
Gui, Add, Edit, w70 vTopLeftY , 0
Gui, Add, Text,, URL:
Gui, Add, Edit, w490 vURL , http://localhost:12332/Web/Node.cshtml
Gui, Add, Text,, URL Parameter to Enumerate through:
Gui, Add, Edit, w210 vURLParameter , clientId
Gui, Add, Text,, Title to Match
Gui, Add, Edit, w210 vTitle , GDO Node :
Gui, Add, Button, default, OK
Gui, Show,, GDO - Create Multiple Borderless Chrome Instances
return  

ButtonOK:
Gui, Submit

Numnodes := (Cols*Rows)

Col := 0
Row := Rows

Loop, %Rows%
{

	Loop, %Cols%
	{
		Parameter := " --app="
		Fullurl = %URL%?%UrlParameter%=%Node%
		run "chrome.exe" --app=%Fullurl%
		Sleep 200
		WinActivate, %Title%%Node%
		WinWaitActive, %Title%%Node%
		WinGet Style, Style, A
		CordX := ((Col*Width)+TopLeftX)
		CordY := (((Row-1)*Height)+TopLeftY)
		if(Style & 0xC40000) {
			WinSet, Style, -0xC40000, A
			WinMove,A,,%CordX%,%CordY%,%Width%,%Height%
		} else {
			WinSet, Style, +0xC40000, A
			WinMove,A,,%CordX%,%CordY%,%Width%,%Height%
		}

		Node += 1
		Col += 1
	}
	Node += (Step-Cols)
	Col := 0
	Row -= 1
}

GUI, Destroy
Exitapp