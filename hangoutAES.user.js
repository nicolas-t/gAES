// ==UserScript==
// @name        HangoutAES
// @description Enrypting your Google Hangouts.
// @namespace   HangoutAES
// @include     https://talkgadget.google.com/*
// @include     https://mail.google.com/mail/*
// @require     http://code.jquery.com/jquery-1.9.1.min.js
// @require     https://raw.github.com/mdp/gibberish-aes/master/dist/gibberish-aes-1.0.0.js
// @grant       none
// @version     1
// ==/UserScript==

/**
 * Nicolas Turlais
 * 2013
 * MIT Licence 
 * https://github.com/nicolas-t/gAES

 * uses jQuery 
 *   http://jquery.com/

 * uses Gibberish AES 
 *   Mark Percival 
 *   https://github.com/mdp/gibberish-aes 
 */

/* hangout : only run in chat frames */
if( (window.location.host == 'talkgadget.google.com' && window.location.hash.substring(0,6) != '#egtn_') ){
    return;
}
/* gmail : only run in top window */
if( (window.location.host == 'mail.google.com' && window.top != window.self) ){
    return;
}

jQuery(window).load(function(){

    /*-----    GLOBALS         ------------------------------------------------------------------------------*/

    /*-------------------------------------------------------------------------------------------------------*/
    /* @whiteList    : The name of the user you want to chat with,and a random passphrase you share with him */
    /*-------------------------------------------------------------------------------------------------------*/ 
    /*-
    //WhiteList exemple : 1 user                                                                            
    var whiteList = [{
                        user       : 'Keith Haring',
                        passphrase : 'a-strong-passphrase'
                    }];

    //WhiteList exemple : 2 users                                                                            
    var whiteList = [{
                        user       : 'Stephen Shore',
                        passphrase : 'a-strong-passphrase'
                    },
                    {
                        user       : 'Andy Warhol',
                        passphrase : 'another-strong-passphrase'
                    }];
    -*/

    var whiteList = [{
                        user : 'Firstname Surname', /* edit here */
                        passphrase : 'abcDEF-123456' /* edit here */
                    }];

    /*-------------------------------------------------------------------------------------------------------*/
    /* @matcherStart : character for detecting the begining of a encrypted string                            */
    /* @matcherStop  : character for detecting the end of a encrypted string                                 */
    /* @refresh      : duration between two chat refreshing (in ms)                                          */
    /*-------------------------------------------------------------------------------------------------------*/
    var matcherStart  = '#',
        matcherStop   = '_',
        refresh       = 1000;

    /*-----    CHAT EVENTS      ----------------------------------------------------------------------------*/

    if(window.location.host == 'talkgadget.google.com'){

        /*------------------------------------------------------------------------------------------------------*/
        /* When the "Enter" key is pressed, if the user is whitelisted...                                       */
        /* Instead of sending the message we encrypt it...                                                      */
        /* Then we submit it encrypted surrounded by the two matchers.                                          */
        /*------------------------------------------------------------------------------------------------------*/
        jQuery(document).on('keydown', "[role='textbox']", function (e){
            if( e.keyCode == 13 ){

                var conversation  = findConversation(jQuery(this));
                var receiver      = findReceiver(conversation);
                var receiverIndex = chat.isWhiteListed(receiver);

                if(receiverIndex < 0 ){ return;}

                var receiverPassphrase = whiteList[receiverIndex].passphrase;
                var clearText          = jQuery(this).text();
                var encryptedText      = GibberishAES.enc(clearText, receiverPassphrase).replace("\n", "");
                
                jQuery(this).text(matcherStart + encryptedText + matcherStop);
            }  
        });

        /*------------------------------------------------------------------------------------------------------*/
        /* We refresh the chat box every x miliseconds...                                                       */
        /* In order to decrypt the encrypted messages (received or sent)                                        */
        /*------------------------------------------------------------------------------------------------------*/
        setInterval(function(){
            chat.updateConversationsContent();
        },refresh);
    }

    /*-----    HISTORY EVENTS      -------------------------------------------------------------------------*/

    /* gmail : history */
    if(window.location.host == 'mail.google.com'){

        /*------------------------------------------------------------------------------------------------------*/
        /* When viewing the chat history the URL changes to #chats/XXXXX                                        */
        /* We check is the viewed history belongs to whitelisted user                                           */
        /* If so we add a "Decrypt" button                                                                      */
        /*------------------------------------------------------------------------------------------------------*/
        jQuery(window).on('hashchange', function() {
            if ( window.location.hash.substring(0, 7) == "#chats/" ) {
                jQuery.each(whiteList, function(index, value){
                    if( history.testHistoryUser(value.user) ){
                        history.createDecryptButton('h1.ha', index);
                    }
                });
            }
        });
    }

    /*-----    CHAT FUNCTIONS        -----------------------------------------------------------------------*/
    var chat = {

        /*------------------------------------------------------------------------------------------------------*/
        /* Decypt all whitelisted conversations messages                                                        */
        /*------------------------------------------------------------------------------------------------------*/
        updateConversationsContent : function(){
            var self = this;
            findAllConversations().each(function(){/*each conversation*/
                var receiver      = findReceiver(jQuery(this));
                var receiverIndex = self.isWhiteListed(receiver);

                if( receiverIndex < 0 ){ return;}

                findAllMessages(jQuery(this)).each(function(){ /*each message*/
                    core.decrypt(whiteList[receiverIndex].passphrase, this);
                });
                
            });
        },

        /*------------------------------------------------------------------------------------------------------*/
        /* similar to indexOf or inArray                                                                        */
        /* returns the index of the user @s or -1 if no user found                                              */
        /*------------------------------------------------------------------------------------------------------*/
        isWhiteListed : function(s) {
            var r = -1;
            jQuery.each(whiteList, function(index, value){
                if( s == value.user ){
                    r = index;
                    return false; //break the loop
                }
            });
            return r;
        }
    }

    /*-----    HISTORY FUNCTIONS        -------------------------------------------------------------------*/
    var history = {

        /*------------------------------------------------------------------------------------------------------*/
        /* Tries to find a whitelisted user name in the <h1> tag of the chat history page                       */
        /*------------------------------------------------------------------------------------------------------*/
        testHistoryUser : function(user){
            var str = jQuery('h1.ha').text();
            var matcher = new RegExp("\\b" + user + "\\b", "g");
            if( str.match(matcher) ){
                return true;
            }
        },

        /*------------------------------------------------------------------------------------------------------*/
        /* Creates a nice google blue button in @parent                                                         */
        /* Bind a function (decryptHistory()) to click, passing whitelisted user @index as param                */
        /*------------------------------------------------------------------------------------------------------*/
        createDecryptButton : function(parent, index){
            jQuery('<span/>',{'class' : 'T-I J-J5-Ji aOA T-I-atl'})
            .html('Decrypt')
            .appendTo(parent)
            .on('click', index, this.decryptHistory)
            .css({'position' : 'absolute' , 'top' : '-4px'});
        },

        /*------------------------------------------------------------------------------------------------------*/
        /* loop trought all history messages and call the decrypt function                                      */
        /* @event.data contain the whitelisted user index (see createDecryptButton() for binding)               */
        /*------------------------------------------------------------------------------------------------------*/
        decryptHistory : function(event){
            var receiverIndex = event.data;
            findAllHistoryMessages().each(function(){
                core.decrypt(whiteList[receiverIndex].passphrase, this);
            });
        }      
    }

    /*-----    CORE FUNCTIONS        ----------------------------------------------------------------------*/
    var core = {

        /*------------------------------------------------------------------------------------------------------*/
        /* uses the two matchers to detect encrypted messages in @str                                           */
        /* loops trought result, remove the matcherStart, stores and returns the clean encrypted messages       */
        /*------------------------------------------------------------------------------------------------------*/
        getMatches : function(str){
            var matcher = new RegExp(matcherStart + "([\\s\\S]*?)(?=" + matcherStop + ")", "g");
            var result = str.match(matcher);
            var r = [];

            if( result ){
                for (var i = 0; i < result.length; i++) {
                    if( result[i].length > 0 ) {
                       r.push(result[i].substring(1, result[i].length));
                    }
                }
            }
            return r;
        },

        /*------------------------------------------------------------------------------------------------------*/
        /* Get encrypted strings with getMatches() in @elem                                                     */
        /* Then for each one decrypts it with @receiverPassphrase                                               */
        /* linkify it and adds it to @elem                                                                      */
        /*------------------------------------------------------------------------------------------------------*/
        decrypt : function (receiverPassphrase, elem){
            var self = this;
            var $message = jQuery(elem);
            var clearStr = $message.text();
            var encryptedStr = this.getMatches(clearStr);
            
            jQuery.each(encryptedStr, function(k,v){ /*each encrypted string in a message*/
                var textDecrypt = GibberishAES.dec(v, receiverPassphrase).replace("\n", "");
                var textClear = clearStr.replace(matcherStart + v + matcherStop, textDecrypt);
                var textParsed = self.linkify(textClear);

                $message.html(textParsed);
            });
        },

        /*------------------------------------------------------------------------------------------------------*/
        /* Detects links in @text and replaces it with html markup for links                                    */
        /*------------------------------------------------------------------------------------------------------*/
        linkify : function(text) {
            text = text.replace(/(https?:\/\/\S+)/gi, function (s) {
                return '<a href="' + s + '">' + s + '</a>';
            });
            return text;
        }
    }

    /*-----    DOM SELECTIONS       ------------------------------------------------------------------------*/
    function findReceiver($conversation){
        return $conversation.find('.RE.OxDpJ').text();
    }

    function findAllMessages($conversation){
        return $conversation.find(".Mu.SP");
    }

    function findConversation($children){
        return $children.parents(".DH.hh.WQ.X0:visible");
    }

    function findAllConversations(){
        return jQuery(".DH.hh.WQ.X0:visible");
    }

    function findAllHistoryMessages(){
        return jQuery("[data-type='m']").find('td.aOV');
    }
});

