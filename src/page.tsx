import * as React from 'react';

import Kikitan from "./pages/Kikitan"

import {
  AppBar,
  Toolbar,
  Typography,
  Select,
  MenuItem,
  Switch,
  Button,
  IconButton,
  CircularProgress
} from '@mui/material';

import {
  GitHub,
  Settings,
  Translate,
} from '@mui/icons-material';

import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-shell'

import SettingsPage from './pages/Settings';
import Scroll from "./components/Scroll"

import { DEFAULT_CONFIG, load_config, update_config } from './util/config';
import { Lang } from './util/constants';
import { getVersion } from '@tauri-apps/api/app';
import Changelogs from './pages/Changelogs';

import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

import { localization } from './util/localization';

let ws: WebSocket | null = null

function App() {
  const [ovr, setOvr] = React.useState(false)
  const [ovrSpeechRecognition, setOvrSpeechRecognition] = React.useState(false)
  const [steamVRReady, setSteamVRReady] = React.useState(false)

  const [vrc, setVrc] = React.useState(true)

  const [quickstartVisible, setQuickstartVisible] = React.useState(true)
  const [changelogsVisible, setChangelogsVisible] = React.useState(false)
  const [settingsVisible, setSettingsVisible] = React.useState(false)
  const [updateVisible, setUpdateVisible] = React.useState(false)

  const [quickstartPage, setQuickstartPage] = React.useState(0)

  const [config, setConfig] = React.useState(DEFAULT_CONFIG)
  const [lang, setLang] = React.useState<Lang | null>(null)

  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    if (loaded) update_config(config)
  }, [config])

  React.useEffect(() => {
    getVersion().then((version) => {
      setChangelogsVisible(localStorage.getItem("changelogsViewed") != version)

      setTimeout(() => localStorage.setItem("changelogsViewed", version), 1000)
    })

    const cfg = load_config()
    const language = localStorage.getItem("lang") as Lang | null
    
    setQuickstartVisible(localStorage.getItem("quickstartMenu") == null || language == null)
    setLang(language == null ? "en" : language)

    setConfig(cfg)

    check().then((update) => {
      setUpdateVisible(update != null)

      update?.downloadAndInstall().then(() => {
        relaunch()
      });
    });
    
    setTimeout(() => setLoaded(true), 300);
  }, [])

  return (
    <>
      <div className={`relative transition-all duration-500 ${!loaded ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        {quickstartVisible && lang != null &&
          <div className={'transition-all z-10 w-full h-screen flex backdrop-blur-sm bg-transparent justify-center items-center absolute'}>
            <div className='flex flex-col justify-between  w-10/12 h-5/6 outline outline-2 outline-white rounded bg-white'>
              <div className='relative mt-2 ml-2 mr-2 h-64'>
                <div className={'absolute inset-0 transition-all flex justify-center ease-in-out ' + (quickstartPage == 0 ? "opacity-100" : "opacity-0 pointer-events-none")}>
                  <div className='absolute mt-28 flex flex-col items-center'>
                    <Scroll></Scroll>

                    <div className='mt-16 absolute flex flex-row items-center'>
                      <Translate className='mr-8' />
                      <Select sx={{
                        color: 'black',
                        '& .MuiSvgIcon-root': {
                          color: 'black'
                        }
                      }} variant='outlined' className="mt-auto mr-8" value={lang} onChange={(e) => {
                        setLang(e.target.value as Lang)

                        console.log(lang)
                      }}>

                        <MenuItem value={"en"}>English</MenuItem>
                        <MenuItem value={"jp"}>日本語</MenuItem>
                        <MenuItem value={"cn"}>中文</MenuItem>
                        <MenuItem value={"kr"}>한국어</MenuItem>
                        <MenuItem value={"tr"}>Türkçe</MenuItem>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className={'absolute inset-0 transition-all flex justify-center ease-in-out ' + (quickstartPage == 1 ? "opacity-100" : "opacity-0 pointer-events-none")}>
                  <div className='absolute mt-2 flex flex-col items-center'>
                    <p className='text-xl bold text-center'>{localization.quickstart_osc[lang]}</p>
                    {quickstartPage == 1 &&
                      <video width={480} autoPlay loop className='mt-4'>
                        <source src="/OSC.mp4" type="video/mp4"></source>
                      </video>
                    }
                  </div>
                </div>

                <div className={'absolute inset-0 transition-all flex flex-col items-center justify-center ease-in-out ' + (quickstartPage == 2 ? "opacity-100" : "opacity-0 pointer-events-none")}>
                  <div className='mt-2 mb-4'>
                    <p className='text-xl bold text-center'>{localization.windows_mic_settings[lang]}</p>
                    <p className='text-lg mt-20 text-center'>{localization.windows_mic_details[lang]}</p>
                  </div>
                  <Button disabled={quickstartPage != 2} className={'w-96 '} variant='contained' startIcon={<Settings />} onClick={() => { invoke("show_windows_audio_settings") }}>{localization.open_win_audio[lang]}</Button>
                </div>

                <div className={'absolute inset-0 transition-all flex justify-center  ease-in-out ' + (quickstartPage == 3 ? "opacity-100" : "opacity-0 pointer-events-none")}>
                  <div className='absolute mt-2 flex flex-col items-center'>
                    <p className='text-xl bold text-center'>{localization.stt_text[lang]}</p>
                    {quickstartPage == 3 &&
                      <video width={480} autoPlay loop className='mt-4'>
                        <source src="/STEAMVR.mp4" type="video/mp4"></source>
                      </video>
                    }
                  </div>
                </div>

                <div className={'absolute inset-0 transition-all flex justify-center  ease-in-out ' + (quickstartPage == 4 ? "opacity-100" : "opacity-0 pointer-events-none")}>
                  <div className='absolute mt-2 flex flex-col items-center'>
                    <p className='text-xl bold text-center'>{localization.mode_selection[lang]}</p>
                    <img className='mt-4 w-[384px]' src={
                      {
                        en: "https://i.imgur.com/2OHmEcT.png",
                        jp: "https://i.imgur.com/yTqbY4c.png",
                        cn: "https://i.imgur.com/iByKH4k.png",
                        kr: "https://i.imgur.com/Gr6UpXO.png",
                        tr: "https://i.imgur.com/1we8FT4.png"
                      }[lang]
                    } width={240} />
                    <p className='text-lg mt-4 text-center'>{localization.mode_selection_details[lang]}</p>
                  </div>
                </div>

                <div className={'absolute inset-0 transition-all space-y-2 flex flex-col items-center justify-center ease-in-out ' + (quickstartPage == 5 ? "opacity-100" : "opacity-0 pointer-events-none")}>
                  <div className='mt-4 mb-4'>
                    <p className='text-xl mt-8 bold text-center'>{localization.thank_you[lang]}</p>
                    <p className='text-lg mt-20 text-center'>{localization.thank_you_details[lang]}</p>
                  </div>
                  <Button disabled={quickstartPage != 5} className={'w-70 '} variant='contained' startIcon={< GitHub />} onClick={async () => { open("https://github.com/YusufOzmen01/kikitan-translator") }}>{localization.open_repo[lang]}</Button>
                  <Button disabled={quickstartPage != 5} className={'w-48 '} variant='contained' onClick={async () => { setQuickstartVisible(false); window.localStorage.setItem("quickstartMenu", "true"); localStorage.setItem("lang", lang) }}>{localization.close_menu[lang]}</Button>
                </div>
              </div>
              <div className='mb-2 flex justify-center space-x-4'>
                <Button variant='contained' disabled={quickstartPage == 0} onClick={() => { setQuickstartPage(quickstartPage - 1) }}>{localization.previous[lang]}</Button>
                <Button className='ml-4' variant='contained' disabled={quickstartPage > 4} onClick={() => { setQuickstartPage(quickstartPage + 1) }}>{localization.next[lang]}</Button>
              </div>
            </div>
          </div>
        }

        {updateVisible &&
          <div className={'transition-all z-20 w-full h-screen flex backdrop-blur-sm bg-transparent justify-center items-center absolute' + (updateVisible ? " opacity-100" : " opacity-0 pointer-events-none")}>
            <div className='flex flex-col justify-center ml-10 w-10/12 h-5/6 outline outline-2 outline-white rounded bg-white'>
              <div className='flex flex-row justify-center'>
                <CircularProgress></CircularProgress>
                <p className='ml-4 text-4xl'>{localization.updating[lang!]}</p>
              </div>
            </div>
          </div>
        }

        {settingsVisible &&
          <div className={'transition-all z-20 w-full h-screen flex backdrop-blur-sm bg-transparent justify-center items-center absolute' + (settingsVisible ? " opacity-100" : " opacity-0 pointer-events-none")}>
            <div className='flex flex-col justify-between  w-10/12 h-5/6 outline outline-2 outline-white rounded bg-white'>
              <SettingsPage lang={lang!} config={config} setConfig={setConfig} closeCallback={() => {
                setLoaded(false)

                setTimeout(() => window.location.reload(), 250)
              }} />
            </div>
          </div>
        }

        {!quickstartVisible && changelogsVisible &&
          <div className={'transition-all z-20 w-full h-screen flex backdrop-blur-sm bg-transparent justify-center items-center absolute' + (changelogsVisible ? " opacity-100" : " opacity-0 pointer-events-none")}>
            <div className='flex flex-col justify-between  w-10/12 h-5/6 outline outline-2 outline-white rounded bg-white'>
              <Changelogs lang={lang!} closeCallback={() => setChangelogsVisible(false)} />
            </div>
          </div>
        }

        <div className="flex flex-col h-screen z-0">
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Kikitan Translator
              </Typography>

              <div className='flex'>
                <p className='mt-2'>VRChat OSC</p>
                <Switch color='secondary' className="ml-4 mr-2" checked={vrc} onChange={(e) => {
                  setVrc(e.target.checked)
                }} />
                <p className='mt-2'>{localization.steamvr_connection[lang!]}</p>
                <Switch color='secondary' disabled={ovr && !steamVRReady} className="ml-4" checked={ovr} onChange={(e) => {
                  setOvr(e.target.checked)

                  if (e.target.checked) {
                    invoke("start_ovr", {}).then(() => {
                      console.log("Starting ovr...")

                      setTimeout(() => {
                        ws = new WebSocket("ws://127.0.0.1/ovr")
                        ws.onopen = () => {
                          console.log("OVR connection opened!")

                          setSteamVRReady(true)
                        }

                        ws.onmessage = (e) => {
                          if (e.data == "SRON" || e.data == "SROFF") {
                            setOvrSpeechRecognition(e.data == "SRON" ? true : e.data == "SROFF" ? false : ovrSpeechRecognition)

                            return
                          }

                          const param = e.data.split(" ")
                          const key = param[0]
                          const value = param[1]

                          update_config({ ...config, [key]: value })
                        }

                        ws.onerror = (e) => {
                          console.log(e)
                          invoke("kill_ovr", {}).then(() => console.log("Killing ovr process..."));

                          setOvr(false)
                          setSteamVRReady(false)
                        }
                      }, 3000)
                    })
                  } else {
                    invoke("kill_ovr", {}).then(() => console.log("Killing ovr process..."));

                    setSteamVRReady(false)
                  }
                }} />
              </div>
              <div className='flex'>
                <Select sx={{
                  color: 'white',
                  '& .MuiSvgIcon-root': {
                    color: 'white'
                  }
                }} variant='outlined' className="ml-4 mr-2" value={config.mode} onChange={(e) => {
                  setConfig({ ...config, mode: parseInt(e.target.value.toString()) })
                  setTimeout(() => { setLoaded(false) }, 100)

                  setTimeout(() => { window.location.reload() }, 300)
                }}>
                  <MenuItem value={0}>{localization.translation[lang!]}</MenuItem>
                  <MenuItem value={1}>{localization.transcription[lang!]}</MenuItem>
                </Select>
                <IconButton sx={{
                  color: 'white',
                  '& .MuiSvgIcon-root': {
                    color: 'white'
                  }
                }} onClick={() => { setQuickstartVisible(true); setQuickstartPage(0) }}>
                  <Translate />
                </IconButton>
                <IconButton sx={{
                  color: 'white',
                  '& .MuiSvgIcon-root': {
                    color: 'white'
                  }
                }} onClick={() => { setSettingsVisible(true) }}>
                  <Settings />
                </IconButton>
              </div>
            </Toolbar>
          </AppBar>
          <div className='flex flex-1 items-center align-middle flex-col mt-16'>
            {loaded && <Kikitan lang={lang!} ovr={ovrSpeechRecognition} vrc={vrc} config={config} setConfig={setConfig} ws={ws}></Kikitan>}
          </div>
        </div>
      </div>
    </>
  )
}

export default App
