'use strict'

const {app, BrowserWindow} = require('electron')
const url = require('url')
const path = require('path')

let about = null


module.exports.openAbout = () => {
	
	if( about === null ) {
		
		about = new BrowserWindow({
			
			show: false,
			width: 340,
			height: 360,
			title: '',
			vibrancy: 'under-window',
			resizable: false,
			minimizable: false,
			maximizable: false,
			alwaysOnTop: true,
			webPreferences: {
				devTools: true,
				nodeIntegration: true,
				enableRemoteModule: true,
				preload: path.join(__dirname, './preload.min.js')
			}
		})
		
		about.loadURL(url.format ({ 
			
			pathname: path.join(__dirname, '../html/about.html'),
			protocol: 'file:', 
			slashes: true 
		}))
		
		about.once('ready-to-show', () => {
			about.show()
		})
		
		about.on('close', () => {
			about = null
		})
	}
}
