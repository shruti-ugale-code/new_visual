# 🚢 AIS Ship Tracker - Real-Time Maritime Surveillance

A modern, professional maritime traffic monitoring system built with React and Leaflet, featuring real-time ship tracking with NOAA AIS data integration.

## 🌊 Live Demo

**🔗 [View Live Application](https://shruti-ugale-code.github.io/new_visual/)**

## ✨ Features

### 🗺️ Interactive Map Visualization
- **Leaflet-powered** interactive maps with responsive design
- **Real-time ship positioning** in maritime waters
- **Color-coded vessel markers** that rotate based on heading
- **Zoom and pan** functionality with smooth animations

### 🚢 MarineTraffic-Style Ship Tracking
- **Professional maritime interface** with industry-standard blue color scheme
- **Real NOAA AIS data** integration
- **Multi-vessel tracking** with detailed information panels
- **Interactive ship selection** and highlighting

### 📊 Real-Time Data Processing
- **NOAA AIS CSV data** parsing and visualization
- **Time-series trajectory** data support
- **Auto-refresh functionality** for live updates
- **Ship classification** by vessel type (Cargo, Tanker, Container, etc.)

### 🎨 Professional Maritime UI
- **Glassmorphism effects** and modern animations
- **Responsive design** supporting all devices
- **Professional blue color scheme** matching maritime industry standards
- **Interactive popups** with comprehensive ship details

## 🚀 Technology Stack

- **Frontend**: React 18.2.0 with Vite
- **Maps**: Leaflet 1.9.4 + React-Leaflet 4.2.1
- **Data Processing**: PapaParse for CSV handling
- **Icons**: Lucide React for modern iconography
- **Styling**: CSS3 with glassmorphism effects
- **Deployment**: GitHub Pages with automated workflows

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Git for version control

### Local Development
```bash
# Clone the repository
git clone https://github.com/shruti-ugale-code/new_visual.git
cd new_visual

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Build for Production
```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

## 🌐 Deployment to GitHub Pages

### Automated Deployment (Recommended)
1. **Push to GitHub**: Commit and push your changes to the main branch
2. **GitHub Actions**: Automated deployment workflow will build and deploy
3. **Live URL**: Access your app at `https://shruti-ugale-code.github.io/new_visual/`

### Manual Deployment
```bash
# Install gh-pages (if not already installed)
npm install --save-dev gh-pages

# Deploy to GitHub Pages
npm run deploy
```

## 📊 Data Sources

### NOAA AIS Data Format
The application supports NOAA Automatic Identification System (AIS) data with the following CSV structure:
```csv
MMSI,BaseDateTime,LAT,LON,SOG,COG,Heading,VesselName,IMO,CallSign,VesselType,Status,Length,Width,Draft,Cargo,TransceiverClass
```

### Supported Vessel Types
- **Cargo Ships** (70-79): Blue markers
- **Tankers** (80-89): Orange markers  
- **Passenger Vessels** (60-69): Purple markers
- **Fishing Vessels** (30-39): Cyan markers
- **Special Craft** (50-59): Green markers

## 🎯 Key Features in Detail

### Ship Tracking Capabilities
- **Real-time positioning** with accurate maritime coordinates
- **Vessel identification** with MMSI, IMO, and call sign
- **Navigation data** including speed, heading, and status
- **Vessel specifications** with length, width, and draft information

### Interactive Map Features
- **Dynamic ship markers** with vessel type color coding
- **Clickable ships** for detailed information popups
- **Ship selection** highlighting across map and panel
- **Automatic map fitting** to show all tracked vessels

### Professional Interface
- **Maritime industry color scheme** with professional blue gradients
- **Glassmorphism effects** for modern visual appeal
- **Responsive ship panel** with comprehensive vessel details
- **Real-time data updates** with loading indicators

## 🛠️ Configuration

### Customizing Ship Data
Replace `/public/noaa-ais-sample.csv` with your own NOAA AIS data file following the standard format.

### Map Settings
Modify map settings in `src/components/MapComponent.jsx`:
- Default center coordinates
- Zoom levels and bounds
- Tile layer providers

### Color Schemes
Customize vessel type colors in `src/components/MapComponent.jsx` and `src/App.css`.

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured interface with side panel
- **Tablet**: Adaptive layout with collapsible panels
- **Mobile**: Touch-optimized controls and responsive design

## 🔧 Development

### Project Structure
```
src/
├── components/
│   ├── MapComponent.jsx     # Interactive Leaflet map
│   ├── Header.jsx           # Navigation and search
│   ├── ShipPanel.jsx        # Ship list and details
│   └── *.css               # Component styles
├── utils/
│   ├── csvParser.js        # CSV data processing
│   └── noaaDataHandler.js  # NOAA format handling
├── App.jsx                 # Main application component
└── App.css                 # Global styles
```

### Adding New Features
1. **Data Sources**: Extend CSV parsing in `utils/csvParser.js`
2. **Map Features**: Add components to `MapComponent.jsx`
3. **UI Elements**: Create new components in `components/`
4. **Styling**: Follow maritime color scheme in existing CSS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NOAA** for providing comprehensive AIS maritime data
- **OpenStreetMap** contributors for map tile services
- **Leaflet** team for the excellent mapping library
- **React** team for the powerful frontend framework

## 📞 Support

For questions, issues, or feature requests:
- **GitHub Issues**: [Create an issue](https://github.com/shruti-ugale-code/new_visual/issues)
- **Documentation**: Check this README and code comments
- **Community**: Join discussions in the Issues section

---

**🌊 Built with passion for maritime technology and real-time data visualization** ⚓