function setNgayOutPlus30() {
    const ngayInInput = document.getElementById('input_ngay_in');
    const ngayOutInput = document.getElementById('input_ngay_out');
    if (ngayInInput && ngayOutInput && ngayInInput.value) {
        const inDate = new Date(ngayInInput.value);
        inDate.setMinutes(inDate.getMinutes() + 30);
        const localOffset = inDate.getTimezoneOffset() * 60000;
        ngayOutInput.value = new Date(inDate.getTime() - localOffset).toISOString().slice(0, 16);
    }
}


function updateMapFromInput() {
    const val = document.getElementById('input_map').value;
    if (val && val.includes(',') && mapInstance) {
        const parts = val.split(',');
        const lat = parseFloat(parts[0].trim());
        const lng = parseFloat(parts[1].trim());
        if (!isNaN(lat) && !isNaN(lng)) {
            mapInstance.setView([lat, lng], 16);
            if (mapMarker) {
                mapMarker.setLatLng([lat, lng]);
            } else {
                const redIcon = L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
                });
                mapMarker = L.marker([lat, lng], { icon: redIcon, draggable: true }).addTo(mapInstance);
                mapMarker.on('dragend', function (e) {
                    const position = mapMarker.getLatLng();
                    document.getElementById('input_map').value = `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`;
                });
            }
        }
    }
}


function initMapPicker(initialValue) {
    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
        mapMarker = null;
    }
    const container = document.getElementById('mapPreview');
    if (!container) return;

    let lat = 21.028511, lng = 105.804817;
    if (initialValue && initialValue.includes(',')) {
        const parts = initialValue.split(',');
        lat = parseFloat(parts[0].trim());
        lng = parseFloat(parts[1].trim());
    }

    mapInstance = L.map('mapPreview').setView([lat, lng], 15);
    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        attribution: 'Google'
    }).addTo(mapInstance);

    const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    if (initialValue && !isNaN(lat) && !isNaN(lng)) {
        mapMarker = L.marker([lat, lng], { icon: redIcon, draggable: true }).addTo(mapInstance);
        mapMarker.on('dragend', function (e) {
            const position = mapMarker.getLatLng();
            document.getElementById('input_map').value = `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`;
        });
    }

    mapInstance.on('click', function (e) {
        const clat = e.latlng.lat.toFixed(6);
        const clng = e.latlng.lng.toFixed(6);
        document.getElementById('input_map').value = `${clat}, ${clng}`;
        if (mapMarker) {
            mapMarker.setLatLng(e.latlng);
        } else {
            mapMarker = L.marker(e.latlng, { icon: redIcon, draggable: true }).addTo(mapInstance);
            mapMarker.on('dragend', function (ev) {
                const pos = mapMarker.getLatLng();
                document.getElementById('input_map').value = `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`;
            });
        }
    });
}


function getLocation() {
    if (navigator.geolocation) {
        document.getElementById('input_map').placeholder = "Đang lấy vị trí...";
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toFixed(6);
                const lng = position.coords.longitude.toFixed(6);
                document.getElementById('input_map').value = `${lat}, ${lng}`;
                updateMapFromInput();
            },
            (error) => {
                alert("Không thể lấy vị trí: " + error.message);
                document.getElementById('input_map').placeholder = "Kinh độ, Vĩ độ...";
            }
        );
    } else {
        alert("Trình duyệt không hỗ trợ Geolocation.");
    }
}


