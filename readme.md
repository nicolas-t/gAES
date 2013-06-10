Say hello to the NSA 
================================  

gAES / hangoutAES
================================

gAES is a (greasemonkey) user script that encrypts/decrypts (AES) your google chats (gTalk or hangout) with one or more contacts    
- Install `gAES.user.js` to encrypt/decrypt your conversations with gTalk  
- Install `hangoutAES.user.js` to encrypt/decrypt your conversations with google Hangouts (g+ and gmail if you enable it...)  

---

##Installation


*Both you and the contact you want to chat with have to install gAES/hangoutAES.*  
After installing GreaseMonkey,
- If you use gTalk click here : [gAES](https://github.com/nicolas-t/gAES/raw/master/gAES.user.js)     
- If you use google Hangouts click here : [hangoutAES](https://github.com/nicolas-t/gAES/raw/master/hangoutAES.user.js)  

GreaseMonkey will suggest you to install the script, do it.  


##Configuration


*Both you and the contact you want to chat with have to configure gAES/hangoutAES.*  
After installing gAES/hangoutAES, it's time to configure it.    
Click on : the `GreaseMonkey icon`> `Manage User Scripts` > `gAES options` > `Edit this User Script` 
  
let's take an exemple:  
I'm `Walker Evans` (on gmail) and I want to chat securely with `August Sander` (on gmail) 

- I (Walker Evans) have to configure the begining of the script like this :     
```javascript
var whiteList = [{
                    user       : 'August Sander',
                    passphrase : 'abcDEF-123456-same-for-both-users'
                }]; 
```

- And August Sander have to configure it like this :
```javascript
var whiteList = [{
                    user       : 'Walker Evans',
                    passphrase : 'abcDEF-123456-same-for-both-users'
                }]; 
```
Save, refresh the gmail tab, et voilà !


##Usage


gAES/hangoutAES encrypts your message on the fly, then decrypts all messages in the chatbox, every seconds (you can configure it).  
When reading chat history gAES/hangoutAES adds a decrypt button to decrypt the encrypted conversation (yes).   

## Dependencies


GreaseMonkey, or a firefox plugin to use userscripts    
jQuery, https://github.com/jquery/jquery  
Gibberish AES (Mark Percival), https://github.com/mdp/gibberish-aes  
 
## Compatibility


Firefox


## Licence


MIT

