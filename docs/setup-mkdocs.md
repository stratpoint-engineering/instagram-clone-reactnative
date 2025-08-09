# MkDocs Setup Guide

Quick setup guide for the React Native Production Documentation.

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

## Installation

### Option 1: Using pip directly

```bash
pip install mkdocs mkdocs-material pymdown-extensions
```

### Option 2: Using requirements.txt

```bash
pip install -r requirements.txt
```

## Running the Documentation

### Development Server

```bash
# Start the development server
mkdocs serve

# The documentation will be available at http://127.0.0.1:8000
```

### Building for Production

```bash
# Build static files
mkdocs build

# Files will be generated in the 'site' directory
```

### Deploying to GitHub Pages

```bash
# Deploy to GitHub Pages (requires git repository)
mkdocs gh-deploy
```

## Mermaid Diagrams

The documentation includes mermaid diagrams for architecture visualization. Since we removed the mermaid plugin to avoid dependency issues, the diagrams will appear as code blocks.

### To enable mermaid rendering:

1. **Option A: Use GitHub Pages** - GitHub automatically renders mermaid diagrams
2. **Option B: Add mermaid plugin** (if you want local rendering):

```bash
pip install mkdocs-mermaid2-plugin
```

Then update `mkdocs.yml`:

```yaml
plugins:
  - search
  - mermaid2

markdown_extensions:
  - pymdownx.superfences:
custom_fences:
  - name: mermaid
class: mermaid
format: !!python/name:mermaid2.fence_mermaid
```

3. **Option C: Use online mermaid editor** - Copy diagram code to https://mermaid.live/

## Troubleshooting

### Common Issues

1. **Python version**: Ensure you're using Python 3.8+
2. **Permission errors**: Use `pip install --user` if needed
3. **Module not found**: Make sure all dependencies are installed

### Verification

```bash
# Check mkdocs installation
mkdocs --version

# Check if all plugins are working
mkdocs serve --verbose
```

## Documentation Structure

The documentation follows this structure:

```
docs/
├── index.md                            # Main landing page
├── setup/                              # Environment setup guides
├── architecture/                       # App architecture patterns
├── ui/                                 # UI development guides
├── native/                             # Native integration
├── tools/                              # Development tools
├── data/                               # Data management
├── security/                           # Security implementation
├── deployment/                         # CI/CD and deployment
└── monitoring/                         # Monitoring and analytics
```

## Next Steps

1. Run `mkdocs serve` to start the development server
2. Navigate to http://127.0.0.1:8000 to view the documentation
3. Edit markdown files in the `docs/` directory
4. Changes will automatically reload in the browser

The documentation is now ready to use without any complex dependencies!
