document.addEventListener('DOMContentLoaded', function() {
  // Initialize mermaid
  mermaid.initialize({
    startOnLoad: true,
    theme: 'default',
    themeVariables: {
      primaryColor: '#2196F3',
      primaryTextColor: '#ffffff',
      primaryBorderColor: '#1976D2',
      lineColor: '#757575',
      secondaryColor: '#f5f5f5',
      tertiaryColor: '#ffffff'
    },
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true
    },
    sequence: {
      useMaxWidth: true
    },
    gantt: {
      useMaxWidth: true
    }
  });

  // Re-render mermaid diagrams when content changes (for SPA navigation)
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        const mermaidElements = document.querySelectorAll('.mermaid');
        if (mermaidElements.length > 0) {
          mermaid.init(undefined, mermaidElements);
        }
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});
