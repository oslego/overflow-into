overflow: into();
================

This is a quick experiment to hilight the look, feel and behavior of a shortand notation (or syntactic sugar) when using CSS Regions in most common use cases.
 
Usage sample (proposed)
--------  
<pre>
    #box1{
        overflow: into(#box2);
    }    
</pre>

     

-----
Current behavior (current workflow)
----            

<pre>
    #box1 *{
        flow-into: flowName;
    },
    
    #box1, #box2{
        flow-from: flowName;
    },
</pre>
