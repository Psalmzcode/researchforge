export function ThemeScript() {
  const script = `
    (function(){
      try {
        var t = localStorage.getItem('sw-theme');
        if (t === 'light') document.documentElement.classList.add('light');
      } catch(e){}
    })();
  `
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
