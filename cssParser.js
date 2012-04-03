/*      
                 
CSSRule = {
    selectorText: "body",
    style: {
        background: red
    }
    parentRule: null,                  
    type: "rule"
}          

CSSTemplateRule = {
    selectorText: "@template name",
    cssRules: [],
    style: {

    },
    parentRule: null,
    type: "template", 
    identifier: "name"
}   

CSSSlotRule = {
    selectorText: "@slot name",
    style: {
    
    },
    parentRule: CSSTemplateRule,
    type: "slot",
    identifier: "name"
}

*/

!function(scope){  
    
    // pre-flight setup
    !function(){
        if (typeof String.prototype.trim !== "function"){
            
            // shameless augmentation of String with a trim function 
            String.prototype.trim = function(string){
                return string.replace(/^\s+/,"").replace(/\s+$/,"")
            }
        }
    }()
    
    function CSSRule(){ 
        this.selectorText = null
        this.style = {}
        this.type = "rule"
    }
    
    CSSRule.prototype = {    
        
         setSelector: function(string){ 
            this.selectorText = string
            
            // detect @-rules in the following format: @rule-name identifier{ }
            var ruleType = string.match(/^@([^\s]+)\s?([^{]+)?/)  

            if (ruleType && ruleType[1]){
                switch (ruleType[1]){
                    case "template":
                        this.type = "template"
                        this.cssRules = []
                    break

                    case "slot":
                        this.type = "slot"
                    break
                    
                    default:
                        this.type = "unknown"
                }   

                // set the identifier of the rule
                this.identifier = ruleType[2] || null
            }
        }, 
        
        setStyle: function(properties){ 
            
            if (!properties){
                throw new TypeError("CSSRule.setStyles(). Invalid input. Expected 'object', got " + properties)
            }        
            
            this.style = properties || {}
            
            return this.style
        }, 
        
        setParentRule: function(rule){ 
            
            if (!rule){
                throw new TypeError("CSSRule.setParentRule(). Invalid input. Expected 'object', got " + properties)
            }        
            
            this.parentRule = rule
            
            return this.parentRule
        }  
    } 
    
    /*
        Naive and blind CSS syntax parser.
        
        The constructor returns a CSSParser object with the following members:
            .parse(string) - method to parse a CSS String into an array of CSSRule objects  
            .clear() - method to remove any previously parsed data
            .cssRules - array with CSSRule objects extracted from the parser input string
    */
    function CSSParser(){ 
            
        /*   
            Extracts the selector-like part of a string.  
            
            Matches anything after the last semicolon ";". If no semicolon is found, the input string is returned. 
            This is an optimistic matching. No selector validation is perfomed.
            
            @param {String} string The string where to match a selector 
            
            @return {String} The selelector-like string
        */
        function getSelector(string){
            var sets = string.trim().split(";")    

            if (sets.length){
                return sets.pop().trim()
            }  

            return null;
        }
        
        /*
            Parse a string and return an object with CSS-looking property sets.   
            
            Matches all key/value pairs separated by ":", 
            themselves separated between eachother by semicolons ";" 
            
            This is an optimistic matching. No key/valye validation is perfomed other than 'undefined'.
            
            @param {String} string The CSS string where to match property pairs
            @return {Obect} The object with key/value pairs that look like CSS properties
        */
        function parseCSSProperties(string){
             var properties = {},
                 sets = string.trim().split(";")

             if (!sets || !sets.length){
                 return properties
             }                    

             sets.forEach(function(set){ 

                 // invalid key/valye pair
                 if (set.indexOf(":") == -1){ 
                     return
                 }         

                 var parts = set.split(":")

                 if (parts[0] !== undefined && parts[1] !== undefined) {
                     properties[parts[0].trim()] = parts[1].trim()
                 }
             }) 

             return properties    
         }
         
         /*
            Parse a string and create CSSRule objects from constructs looking like CSS rules with valid grammar.  
            CSSRule objects are added to the 'cssRules' Array of the CSSParser object.
            
            This is an optimistic matching. Minor syntax validation is used.    
             
            Supports nested rules.             
            
            Example: 
            @template{
                
                @slot{
                
                }
            }     
            
         */
         function parseBlocks(string, set, parent){
             var start = string.indexOf("{") 

             if (start > 0){
                 var properties,
                     rule = new CSSRule,
                     token = string.substring(0, start),
                     selector = getSelector(token),
                     remainder = string.substr(start + 1, string.length),
                     end = remainder.indexOf("}"),
                     nextStart = remainder.indexOf("{");
                     
                 rule.setSelector(selector)

                 if (parent){  
                     rule.setParentRule(parent)
                    
                    /*
                        If it's a nested structure (a parent exists) properties might be mixed in with nested rules.
                        Make sure the parent gets both its styles and nested rules   
                        
                        Example:
                        @template{
                        
                            background: green;
                            
                            @slot{
                                
                            } 
                        }
                    */  
                    properties = parseCSSProperties(token)

                    parent.setStyle(properties)
                 }

                  // nested blocks! the next "{" occurs before the next "}"
                 if (nextStart > -1 && nextStart < end){  
                     
                     properties = parseCSSProperties(token)    

                     rule.setStyle(properties)
                     rule.cssRules = rule.cssRules || []

                     parseBlocks(remainder, rule.cssRules, rule)
                 }
                 else{ 
                     properties = parseCSSProperties(remainder.substring(0, end)) 
                        
                     rule.setStyle(properties)
                     
                     // get the unparsed remainder of the CSS string
                     remainder = remainder.substring(end + 1, string.length)

                     // continue parsing the remainder of the CSS string
                     parseBlocks(remainder, set)        
                 }  
                                 
                 // prepend this CSSRule to the cssRules array
                 set.unshift(rule); 
             }
         }
        
        return{     
            cssRules: [],
            
            parse: function(string){ 
                
                string = string.replace(/[\n\t]+/g, "").trim()
                parseBlocks(string, this.cssRules)
            },   
            
            clear: function(){
                this.cssRules = [];
            }
        }
    }
    
    scope = scope || window
    scope["CSSParser"] = CSSParser 
       
}(window)