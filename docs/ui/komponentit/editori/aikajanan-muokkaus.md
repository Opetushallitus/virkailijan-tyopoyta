# Aikajanan muokkaus

`/ui/app/components/editor/EditTimeline.jsx`
`/ui/app/components/editor/EditTimelineItem.jsx`

Aikajanaa muokataan editorin aikajana-välilehdellä.

Tapahtuman päivämäärää ei ole rajoitettu. Tapahtumat julkaistaan aikajanalla heti.

Välilehden valinnassa näytettävä validaatioteksti määräytyy tapahtumien mukaan:
- tyhjä, kaikkien tapahtumien kaikki pakolliset kentät ovat tyhjiä
- määrä, jos vähintään yhden tapahtuman kaikki pakolliset kentät on täytetty
