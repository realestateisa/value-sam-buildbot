import { TERRITORIES, Territory } from '@/types/chat';

export function detectTerritory(location: string): Territory | null {
  const normalizedLocation = location.toLowerCase().trim();
  
  // Direct territory name match
  for (const [key, territory] of Object.entries(TERRITORIES)) {
    if (normalizedLocation.includes(territory.name.toLowerCase())) {
      return territory;
    }
  }
  
  // County match
  for (const territory of Object.values(TERRITORIES)) {
    for (const county of territory.counties) {
      const normalizedCounty = county.toLowerCase();
      const countyName = normalizedCounty.replace(', nc', '').replace(', sc', '');
      
      if (normalizedLocation.includes(countyName) || 
          normalizedLocation.includes(normalizedCounty)) {
        return territory;
      }
    }
  }
  
  return null;
}

export function getCalendarEmbedCode(territory: Territory): string {
  const namespace = territory.calNamespace;
  
  return `
<!-- Cal inline embed code begins -->
<div style="width:100%;height:100%;overflow:scroll" id="my-cal-inline-${namespace}"></div>
<script type="text/javascript">
  (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
Cal("init", "${namespace}", {origin:"https://app.cal.com"});

  Cal.ns.${namespace}("inline", {
    elementOrSelector:"#my-cal-inline-${namespace}",
    config: {"layout":"month_view"},
    calLink: "${territory.calLink}",
  });

  Cal.ns.${namespace}("ui", {"cssVarsPerTheme":{"light":{"cal-brand":"#E2362B"}},"hideEventTypeDetails":false,"layout":"month_view"});
</script>
<!-- Cal inline embed code ends -->
  `.trim();
}
