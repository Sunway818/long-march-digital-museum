$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName PresentationCore
$reviewRoot = $PSScriptRoot
$cases = @(
    @{name='A / Zhi Mang Xing';file='ZhiMangXing-Regular.ttf';track=6},
    @{name='B / Ma Shan Zheng';file='MaShanZheng-Regular.ttf';track=6},
    @{name='C / Liu Jian Mao Cao';file='LiuJianMaoCao-Regular.ttf';track=6}
)
$bitmap = [System.Drawing.Bitmap]::new(1800,1200)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#100D0D'))
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$cream = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#F2EDE5'))
$gold = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#B99A61'))
$muted = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#BDB3A7'))
$labelFont = [System.Drawing.Font]::new('Segoe UI',28,[System.Drawing.FontStyle]::Regular,[System.Drawing.GraphicsUnit]::Pixel)
$smallFont = [System.Drawing.Font]::new('Segoe UI',21,[System.Drawing.FontStyle]::Regular,[System.Drawing.GraphicsUnit]::Pixel)
$report = @()
for($index=0;$index -lt $cases.Count;$index++) {
    $case=$cases[$index]
    $fontPath=Join-Path $reviewRoot "fonts/$($case.file)"
    $glyphFace=[System.Windows.Media.GlyphTypeface]::new([uri]$fontPath)
    $glyphs=@()
    foreach($character in '伟大征程'.ToCharArray()) {
        $glyph=$glyphFace.CharacterToGlyphMap[[int]$character]
        if(-not $glyph){throw "Missing glyph $character in $fontPath"}
        $glyphs+= [int]$glyph
    }
    $privateFonts=[System.Drawing.Text.PrivateFontCollection]::new()
    $privateFonts.AddFontFile($fontPath)
    $family=$privateFonts.Families[0]
    $rowY=40+$index*365
    $graphics.DrawString($case.name,$labelFont,$gold,50,$rowY+25)
    $graphics.DrawString('Same font size / same 6px spacing',$smallFont,$muted,50,$rowY+78)
    $graphics.DrawString('Upper: 156px   Lower: 112px',$smallFont,$muted,50,$rowY+115)
    $graphics.DrawString('Actual TTF outlines; no synthetic bold',$smallFont,$muted,50,$rowY+152)
    foreach($size in @(156,112)) {
        $x=640.0
        $y=$rowY+$(if($size -eq 156){0}else{190})
        $allBounds=@()
        foreach($character in '伟大征程'.ToCharArray()) {
            $path=[System.Drawing.Drawing2D.GraphicsPath]::new()
            $path.AddString([string]$character,$family,0,[single]$size,[System.Drawing.PointF]::new($x,$y),[System.Drawing.StringFormat]::GenericTypographic)
            $bounds=$path.GetBounds()
            if($bounds.Right -gt 1770 -or $bounds.Bottom -gt 1160){throw 'Clipped specimen'}
            $allBounds+=@{x=$bounds.X;y=$bounds.Y;width=$bounds.Width;height=$bounds.Height}
            $graphics.FillPath($(if($size -eq 156){$cream}else{$gold}),$path)
            $x+=$glyphFace.AdvanceWidths[$glyphFace.CharacterToGlyphMap[[int]$character]]*$size+$case.track
            $path.Dispose()
        }
        $report+=@{font=$case.file;family=$family.Name;size=$size;spacing=$case.track;glyphIds=$glyphs;bounds=$allBounds;sha256=(Get-FileHash -LiteralPath $fontPath -Algorithm SHA256).Hash.ToLower()}
    }
    $privateFonts.Dispose()
}
$graphics.DrawString('FONT STUDY ONLY / No background pixels copied or exported',$smallFont,$muted,50,1165)
$bitmap.Save((Join-Path $reviewRoot 'font-comparison.png'),[System.Drawing.Imaging.ImageFormat]::Png)
$report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $reviewRoot 'font-render-report.json') -Encoding utf8
$graphics.Dispose();$bitmap.Dispose();$cream.Dispose();$gold.Dispose();$muted.Dispose();$labelFont.Dispose();$smallFont.Dispose()
Write-Output 'Rendered 3 real font files at 156px and 112px; all four glyphs present; no clipped outlines.'
