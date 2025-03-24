# Icon Generator & Store

A flexible icon generator that generates icon and stores them for ease of use.

## Features

- Modular architecture for easy extension
- Efficient icon management and storage
- Customizable icon sets
- Automatic icon importation and organization (from github repo. E.g. https://github.com/phosphor-icons/core/tree/main/assets/regular)

## Project Structure

```
icon-generator/
├── src/
│   ├── core/           # Core functionality
│   ├── data/           # Icon data and configurations
│   └── utils/          # Utility functions
└── scripts/            # Build and utility scripts
```

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/builtnorth/icon-generator.git
cd icon-generator
```

2. Generate icons & follow prompts:
```bash
npm run generate-icons
```

The script will prompt you for:
1. GitHub repository URL (e.g., https://github.com/phosphor-icons/core/tree/main/assets/regular)
2. Icon set name (e.g., phosphor)
3. Icon set label (e.g., Phosphor Icons)

This will:
- Download SVG icons from the repository
- Create a data file in `src/data/`
- Create a configuration file in `src/core/icons/`
- Update the store.js with the new icon set

### Removing Icons

To remove an icon set:

```bash
npm run remove-icons
```

This will"
- Remove the icon data file
- Remove the icon config file
- Remove references to icon library in store.js


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

GPL-2.0-or-later


## Disclaimer

This software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.

Use of this library is at your own risk. The authors and contributors of this project are not responsible for any damage to your website or any loss of data that may result from the use of this library.

While we strive to keep this library up-to-date and secure, we make no guarantees about its performance, reliability, or suitability for any particular purpose. Users are advised to thoroughly test the library in a safe environment before deploying it to a live site.

By using this library, you acknowledge that you have read this disclaimer and agree to its terms.