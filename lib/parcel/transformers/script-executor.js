window.executeScriptsWithOriginalTypes = function() {
    var scripts = Array.from(document.querySelectorAll('script[type="text/plain"][data-script-order]')).sort(function(a, b) {
      return parseInt(a.getAttribute('data-script-order')) - parseInt(b.getAttribute('data-script-order'));
    });
    
    var currentIndex = 0;
    
    function executeNext() {
      if (currentIndex >= scripts.length) {
        // All scripts have been loaded - dispatch synthetic DOMContentLoaded event
        document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true }));
        return;
      }
      
      var script = scripts[currentIndex++];
      var dataSrc = script.getAttribute('data-src');
      var originalType = script.getAttribute('data-original-type');
      
      if (dataSrc) {
        // External script - create new script element with original type
        var newScript = document.createElement('script');
        if (originalType) {
          newScript.type = originalType;
        }
        newScript.src = dataSrc;
        
        // Wait for script to load before continuing
        newScript.onload = executeNext;
        newScript.onerror = executeNext; // Continue even if script fails to load
        
        // Replace the old script with the new one
        script.parentNode.insertBefore(newScript, script);
        script.parentNode.removeChild(script);
      } else {
        // Inline script - create new script element with original type
        var newScript = document.createElement('script');
        if (originalType) {
          newScript.type = originalType;
        }
        newScript.textContent = script.textContent || script.innerHTML;
        
        // Replace the old script with the new one
        script.parentNode.insertBefore(newScript, script);
        script.parentNode.removeChild(script);
        
        executeNext();
      }
    }
    
    executeNext();
};

function runOnce() {
  document.removeEventListener('DOMContentLoaded', runOnce);
  window.executeScriptsWithOriginalTypes();
}
document.addEventListener('DOMContentLoaded', runOnce);