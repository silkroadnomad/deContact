import { readable } from 'svelte/store'
import { browser } from '$app/environment';

function getHash () {
    if(browser){
        const hashWithDID = location.hash.replace(/^#/, '')
        if(hashWithDID.length===1) return ""
        return hashWithDID.indexOf('/',1)!==-1?hashWithDID.substring(0,hashWithDID.indexOf('/',1)):hashWithDID
    }
}

function getDID () {
    if(browser){
        const hashWithDID = location.hash.replace(/^#/, '')
        if(hashWithDID.length===1) return ""
        return hashWithDID.split("/")[2].substring(0,hashWithDID.split("/")[2].indexOf("?"))
    }
}

function getQuery(){
    if(browser) {
        const hashWithQueryParam = location.hash.replace(/^#/, '')
        return hashWithQueryParam.indexOf('?') !== -1 ? hashWithQueryParam.substring(hashWithQueryParam.indexOf('?') + 1, hashWithQueryParam.length) : undefined
    }
}

export const hash = new readable(getHash(), set => {
    function setHash () {
        set(getHash())
    }

    window.addEventListener('hashchange', setHash)
    return () => window.removeEventListener('hashchange', setHash)
})

export const query = new readable(getQuery(), set => {
    function setQuery () {
        set(getQuery())
    }

    window.addEventListener('hashchange', setQuery)
    return () => window.removeEventListener('hashchange', setQuery)
})

export const did = new readable(getDID(), set => {
    function setDID () {
        set(getDID())
    }

    window.addEventListener('hashchange', setDID)
    return () => window.removeEventListener('hashchange', setDID)
})

