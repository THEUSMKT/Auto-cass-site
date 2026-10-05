import {spawnSync} from 'node:child_process';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {Buffer} from 'node:buffer';

// curl uses the environment's HTTPS proxy and trust store. TLS verification is never disabled.
export async function fetchPublic(rawUrl) {
 const url=new URL(rawUrl);
 if(url.protocol!=='https:' || url.username || url.password)throw new Error('A fonte deve ser HTTPS pública, sem credenciais na URL.');
 const directory=await mkdtemp(path.join(os.tmpdir(),'autocass-fetch-'));
 try {
  const body=path.join(directory,'body');
  const result=spawnSync('curl',['--silent','--show-error','--location','--max-redirs','5','--max-time','30','--proto','=https','--proto-redir','=https','--max-filesize','30000000','--output',body,'--write-out','%{http_code}\n%{url_effective}\n%{content_type}',url.href],{encoding:'utf8',maxBuffer:1024*1024});
  const [code,effectiveUrl,contentType]=result.stdout?.trim().split('\n')??[];
  let buffer=Buffer.alloc(0);try{buffer=await readFile(body);}catch{}
  const ok=result.status===0 && Number(code)>=200 && Number(code)<300;
  return {ok,status:Number(code)||null,url:effectiveUrl||url.href,contentType:contentType??'',buffer,error:ok?null:(result.stderr?.trim()||buffer.toString('utf8').slice(0,200)||`HTTP ${code}`).slice(0,400)};
 } finally {await rm(directory,{recursive:true,force:true});}
}
