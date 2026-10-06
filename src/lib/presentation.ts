// Equipment wording is retained; these changes only repair typography and casing.
export function presentEquipment(raw: string): string {
 let text=raw.replace(/[\u200B-\u200D\uFEFF]/g,'').replace(/\s+/g,' ').trim().toLocaleLowerCase('pt-BR');
 text=text.replace(/\bcom\s+com\b/g,'com')
  .replace(/ar[- ]c0ndicionado/g,'ar-condicionado')
  .replace(/ar condicionado/g,'ar-condicionado')
  .replace(/fárois/g,'faróis').replace(/atraés/g,'através')
  .replace(/\bair bags\b/g,'airbags')
  .replace(/head-up-display/g,'head-up display');
 const names: Record<string,string>={
  abs:'ABS',acc:'ACC',cvt:'CVT',gps:'GPS',usb:'USB',led:'LED',isofix:'ISOFIX',jbl:'JBL',
  'wi-fi':'Wi-Fi',bose:'Bose',dirac:'Dirac',meridian:'Meridian',sony:'Sony',
  harman:'Harman',kardon:'Kardon','auto hold':'Auto Hold','soft close':'Soft Close',
 };
 for(const [word,name] of Object.entries(names))text=text.replace(new RegExp(`\\b${word}\\b`,'g'),name);
 return text.charAt(0).toLocaleUpperCase('pt-BR')+text.slice(1);
}
