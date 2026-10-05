import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./tests/browser',fullyParallel:false,workers:2,retries:0,
 use:{baseURL:'http://127.0.0.1:4330',launchOptions:process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:undefined,trace:'retain-on-failure'},
 reporter:[['list'],['html',{open:'never'}]],
 webServer:[
  {command:'node scripts/serve-static.mjs --port 4330',url:'http://127.0.0.1:4330/Auto-cass-site/',reuseExistingServer:false},
  {command:'node scripts/test-fixture.mjs',url:'http://127.0.0.1:4331/Auto-cass-site/',reuseExistingServer:false,timeout:120000},
 ],
});
