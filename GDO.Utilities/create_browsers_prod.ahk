Width := 1920
Height := 1080
Cols := 1
Rows := 2
URL := "http://dsigdoprod.dsi.ic.ac.uk//Web/Node.cshtml"
URLParameter :="clientId"
Title := "GDO Node "
TopLeftX := 0
TopLeftY := 0
Node := 0
Step := 16
Node += %1%

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
		Sleep 400
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

Exitapp
