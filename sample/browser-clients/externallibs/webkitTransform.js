        (function($){
 
	jQuery.fn.webkitTransform = function(cssstring) {
 
        return this.each(function() {
            var element = $(this);
            var wtstring;
            if($(element).attr('remember_webkit_transform'))
            {
            	wtstring=$(element).attr('remember_webkit_transform');
            }
            else
            {
            	;
            }
        
            if(!wtstring)
            {
            	wtstring=cssstring;
            }
            else
            {
            	
            	csA= new Array();
            	csA=cssstring.split(' ');
            	csAA=new Array();
            	for (var i=0; i<csA.length; i++)
            	{
            	
            		tempA=csA[i].split('(');
            		
            		if(tempA.length==2)
            		{
            			tempA[0]=jQuery.trim(tempA[0]);
            			tempA[1]=jQuery.trim(tempA[1]);
            			tempA[1]=tempA[1].substring(0,(tempA[1].length-1));
            		}
            		csAA[tempA[0]]=tempA[1];
            	}
    		
            	
            	wtA= new Array();
            	wtA=wtstring.split(' ');
            	wtAA=new Array();
            	for (var i=0; i<wtA.length; i++)
            	{
            	
            		tempA=wtA[i].split('(');
            		
            		if(tempA.length==2)
            		{
            			tempA[0]=jQuery.trim(tempA[0]);
            			tempA[1]=jQuery.trim(tempA[1]);
            			tempA[1]=tempA[1].substring(0,(tempA[1].length-1));
            		}
            	
            		wtAA[tempA[0]]=tempA[1];
            		
    			}
            
            	for (j in csAA)
            	{
            		wtAA[j]=csAA[j];
            	}
            	
            	var tempwtstring='';
            	for(z in wtAA)
            	{
            		if(wtAA[z])
            		{
            			tempwtstring=tempwtstring+z+'('+wtAA[z]+') ';
            		}
            	}
            
            	wtstring=tempwtstring;
            }
     
            $(element).css('-webkit-transform', wtstring);
            $(element).css('-moz-transform', wtstring);
            $(element).css('-o-transform', wtstring);
            $(element).css('transform', wtstring);
            $(element).attr('remember_webkit_transform', wtstring)
       
            return element;
        });
	};
 
	
 
})(jQuery);