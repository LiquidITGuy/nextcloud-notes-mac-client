'use strict'

const i18n 				= require( './i18n.min' )
const {ipcRenderer} 	= require( 'electron' )
const Store 			= require( 'electron-store' )
const store 			= new Store()
const $ 				= require( 'jquery' )
const jqueryI18next 	= require( 'jquery-i18next' )

jqueryI18next.init(i18n, $)



//note(dgmid): set lang & localize strings

$('html').attr('lang', i18n.language)
$('title').localize()
$('header').localize()
$('option').localize()
$('label').localize()



//note(dgmid): log exceptions

window.onerror = function( error, url, line ) {
	
	ipcRenderer.send( 'error-in-render', {error, url, line} )
}


ipcRenderer.on('touchbar-zoom', (event, message) => {
	
	$('#zoom').val( message )
	store.set( 'appSettings.zoom', message )
	ipcRenderer.send('set-zoom-slider', parseInt( message ) )
})


ipcRenderer.on('touchbar-theme', (event, message) => {
	
	store.set( 'appInterface.theme', message )
	
	if( message == 'default' ) {
		
		$('#os-theme').prop('checked', true)
		localStorage.removeItem('user_theme')
		ipcRenderer.send('update-theme', message )
		__setTheme()
		
	} else {
		
		$(`#${message}`).prop('checked', true)
		localStorage.user_theme = message
		ipcRenderer.send('update-theme', message )
		__setTheme()
	}
})


$(document).ready(function() {
	
	$( '.select-container select' ).each(function( i, obj ) {
		
		let select = document.querySelector( '#select-svg' ),
		clone = select.content.cloneNode( true )
		
		$( obj ).after( clone )
	})
	
	$( 'input[type="radio"]' ).each(function( i, obj ) {
		
		let radio = document.querySelector( '#radio-svg' ),
			clone = radio.content.cloneNode( true )
			
			$( obj ).after( clone )
	})
	
	$('#sortby').val( store.get('appSettings.sortby') )
	$('#orderby').val( store.get('appSettings.orderby') )
	$('#zoom').val( store.get('appSettings.zoom') )
	$(`#${store.get('appSettings.cursor')}`).prop('checked', true)
	$('#stopwords').prop('checked', store.get('appSettings.stopwords') )
	$('#stemming').prop('checked', store.get('appSettings.stemming') )
	
	
	if( localStorage.user_theme ) {
		
		$(`#${localStorage.user_theme}`).prop('checked', true)
		
	} else {
		
		$('#os-theme').prop('checked', true)
	}
	
	
	$('select, input').on('change', function() {
		
		let name = $(this).attr('name'),
			val = $(this).val()
			
		switch( name ) {
			
			case 'sortby':
			case 'orderby':
				store.set( `appSettings.${name}`, val )
				ipcRenderer.send('reload-sidebar', null )
			break
			
			case 'zoom':
				let level = parseInt( val )
				store.set( `appSettings.${name}`, level )
				ipcRenderer.send( 'update-textslider-touchbar', level )
				ipcRenderer.send( 'set-zoom-slider', level )
			break
			
			case 'cursor':
				store.set( `appSettings.${name}`, val )
			break
			
			case 'stopwords':
				let stopwords = $('#stopwords').is(':checked')
				store.set( `appSettings.${name}`, stopwords )
			break
			
			case 'stemming':
				let stemming = $('#stemming').is(':checked')
				store.set( `appSettings.${name}`, stemming )
			break
			
			case 'theme':
				
				let theme = $('[name$=theme]:checked').val()
				
				store.set( 'appInterface.theme', theme )
				ipcRenderer.send( 'update-themeselect-touchbar', theme )
				
				if( theme == 'default' ) {
					
					localStorage.removeItem('user_theme')
					ipcRenderer.send('update-theme', theme )
					__setTheme()
					
				} else {
					
					localStorage.user_theme = theme
					ipcRenderer.send('update-theme', theme )
					__setTheme()
				}
			break
		}
	})
})
