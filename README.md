<h1>TRIO</h1>

<p>Trio is a small vanilla JavaScript web app that lets users discover movies, podcasts, and books using keywords or random exploration.</p>

<h2>Features</h2>
    <ul>
        <li>Search media by keyword.</li>
        <li>Discover random movies, podcasts, or books.</li>
        <li>Move through results , bookmarking or discarding items.</li>
        <li>Autocomplete suggestions while typing.</li>
    </ul>

<h2>How It Was Built</h2>
    <ul>
        <li>Written in plain JavaScript.</li>
        <li>UI is created dynamically through reusable helper functions.</li>
        <li>Application state is kept in a shared module and updated explicitly.</li>
        <li>API calls are handled asynchronously using async / await.</li>
        <li>Debounce and throttle utilities are used to avoid unnecessary requests.</li>
    </ul>

<h2>Module Structure</h2>
    <ul>
        <li><strong>api.js</strong> — handles external API requests and data fetching.</li>
        <li><strong>media-controller.js</strong> — manages media flow, navigation, and user actions.</li>
        <li><strong>utilities.js</strong> — shared helper and utility functions.</li>
        <li><strong>directory.js</strong> — centralized application state and configuration.</li>
        <li><strong>entry.js</strong> — application entry point; initializes pages and bootstraps the UI.</li>
        <li><strong>explore-ui.js</strong> — builds and updates the media exploration interface.</li>
        <li><strong>collection-ui.js</strong> — creates and manages the bookmarked media collection UI.</li>
    </ul>

<h2>Current Limitations</h2>
    <ul>  
        <li>Application state is persisted using localStorage only (no backend).</li>
        <li>Error handling could be expanded.</li>
        <li>Planned improvements include accessibility enhancements and keyboard navigation.</li>
    </ul>

