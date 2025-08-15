document.addEventListener('DOMContentLoaded', function() {
  // Function to detect current theme
  function getCurrentTheme() {
    const body = document.body;
    const html = document.documentElement;

    // Check for Material theme dark mode classes
    if (body.getAttribute('data-md-color-scheme') === 'slate' ||
        html.getAttribute('data-md-color-scheme') === 'slate' ||
        body.classList.contains('md-theme--slate')) {
      return 'dark';
    }

    // Fallback to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  // Function to get theme configuration
  function getThemeConfig(theme) {
    if (theme === 'dark') {
      return {
        theme: 'dark',
        themeVariables: {
          primaryColor: '#3b82f6',
          primaryTextColor: '#e5e7eb',
          primaryBorderColor: '#2563eb',
          lineColor: '#6b7280',
          secondaryColor: '#374151',
          tertiaryColor: '#1f2937',
          background: '#111827',
          mainBkg: '#1f2937',
          secondBkg: '#374151',
          tertiaryBkg: '#4b5563',
          // Node colors
          nodeBkg: '#374151',
          nodeTextColor: '#e5e7eb',
          nodeBorder: '#6b7280',
          // Edge colors
          edgeLabelBackground: '#1f2937',
          // Class diagram colors
          classText: '#e5e7eb',
          // Sequence diagram colors
          actorBkg: '#374151',
          actorTextColor: '#e5e7eb',
          actorLineColor: '#6b7280',
          signalColor: '#9ca3af',
          signalTextColor: '#e5e7eb',
          // Gantt colors
          gridColor: '#4b5563',
          section0: '#1f2937',
          section1: '#374151',
          section2: '#4b5563',
          section3: '#6b7280',
          // Git colors
          git0: '#3b82f6',
          git1: '#10b981',
          git2: '#f59e0b',
          git3: '#ef4444',
          git4: '#8b5cf6',
          git5: '#06b6d4',
          git6: '#84cc16',
          git7: '#f97316'
        }
      };
    } else {
      return {
        theme: 'default',
        themeVariables: {
          primaryColor: '#2196F3',
          primaryTextColor: '#ffffff',
          primaryBorderColor: '#1976D2',
          lineColor: '#757575',
          secondaryColor: '#f5f5f5',
          tertiaryColor: '#ffffff',
          background: '#ffffff',
          mainBkg: '#ffffff',
          secondBkg: '#f8f9fa',
          tertiaryBkg: '#e9ecef',
          // Node colors
          nodeBkg: '#ffffff',
          nodeTextColor: '#333333',
          nodeBorder: '#cccccc',
          // Edge colors
          edgeLabelBackground: '#ffffff',
          // Class diagram colors
          classText: '#333333',
          // Sequence diagram colors
          actorBkg: '#ffffff',
          actorTextColor: '#333333',
          actorLineColor: '#666666',
          signalColor: '#333333',
          signalTextColor: '#333333',
          // Gantt colors
          gridColor: '#e0e0e0',
          section0: '#f8f9fa',
          section1: '#e9ecef',
          section2: '#dee2e6',
          section3: '#ced4da',
          // Git colors
          git0: '#2196F3',
          git1: '#4CAF50',
          git2: '#FF9800',
          git3: '#F44336',
          git4: '#9C27B0',
          git5: '#00BCD4',
          git6: '#8BC34A',
          git7: '#FF5722'
        }
      };
    }
  }

  // Initialize mermaid with a stable, theme-neutral configuration
  function initializeMermaid() {
    // Use a more stable configuration that works well with CSS theming
    mermaid.initialize({
      startOnLoad: false, // We'll manually control initialization
      theme: 'base', // Use base theme and let CSS handle colors
      themeVariables: {
        primaryColor: '#3b82f6',
        primaryTextColor: '#1f2937',
        primaryBorderColor: '#2563eb',
        lineColor: '#6b7280',
        secondaryColor: '#f3f4f6',
        tertiaryColor: '#ffffff',
        background: '#ffffff',
        mainBkg: '#ffffff',
        secondBkg: '#f8fafc',
        tertiaryBkg: '#f1f5f9'
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      },
      sequence: {
        useMaxWidth: true,
        wrap: true,
        width: 150
      },
      gantt: {
        useMaxWidth: true,
        leftPadding: 75,
        rightPadding: 20
      },
      class: {
        useMaxWidth: true
      },
      state: {
        useMaxWidth: true
      },
      er: {
        useMaxWidth: true
      },
      journey: {
        useMaxWidth: true
      },
      gitGraph: {
        useMaxWidth: true,
        mainBranchName: 'main'
      }
    });
  }

  // Initial setup
  initializeMermaid();

  // Store the current theme to detect changes
  let currentTheme = getCurrentTheme();

  // Watch for theme changes - but don't re-render existing diagrams
  const themeObserver = new MutationObserver(function(mutations) {
    let themeChanged = false;

    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes') {
        const target = mutation.target;
        if ((target === document.body || target === document.documentElement) &&
            (mutation.attributeName === 'data-md-color-scheme' ||
             mutation.attributeName === 'class')) {
          const newTheme = getCurrentTheme();
          if (newTheme !== currentTheme) {
            currentTheme = newTheme;
            themeChanged = true;
          }
        }
      }

      // Watch for new mermaid elements (page navigation)
      if (mutation.type === 'childList') {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasMermaidElements = addedNodes.some(node =>
          node.nodeType === Node.ELEMENT_NODE &&
          (node.classList?.contains('mermaid') || node.querySelector?.('.mermaid'))
        );

        if (hasMermaidElements) {
          // Initialize new diagrams with current theme
          setTimeout(() => {
            const newMermaidElements = document.querySelectorAll('.mermaid:not([data-processed])');
            if (newMermaidElements.length > 0) {
              mermaid.init(undefined, newMermaidElements);
            }
          }, 100);
        }
      }
    });

    if (themeChanged) {
      // Only re-initialize mermaid config for future diagrams
      // Don't touch existing diagrams to avoid crashes
      initializeMermaid();

      // Add a visual indicator that theme changed
      console.log('Mermaid theme updated to:', currentTheme);
    }
  });

  // Observe theme changes on body and html elements
  themeObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-md-color-scheme', 'class'],
    childList: true,
    subtree: true
  });

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-md-color-scheme', 'class']
  });

  // Handle page navigation (for SPA-like behavior)
  window.addEventListener('popstate', function() {
    setTimeout(() => {
      const mermaidElements = document.querySelectorAll('.mermaid:not([data-processed])');
      if (mermaidElements.length > 0) {
        mermaid.init(undefined, mermaidElements);
      }
    }, 100);
  });

  // Initialize any existing mermaid diagrams
  setTimeout(() => {
    const mermaidElements = document.querySelectorAll('.mermaid:not([data-processed])');
    if (mermaidElements.length > 0) {
      mermaid.init(undefined, mermaidElements);
    }
  }, 100);
});
