import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const GoogleMapComponent = () => {
    const [map, setMap] = useState(null);
    const [polygons, setPolygons] = useState([]);
    const [editingPolygon, setEditingPolygon] = useState(null);
    const [selectedPolygon, setSelectedPolygon] = useState(null);
    const [formValues, setFormValues] = useState({
      ucName: '',
      population: '',
      households: '',
      incomeGroup: '', 
      wasteCategories: {
        Residential: {
          checked: false,
          subcategories: {
            Paper: { checked: false, value: '' },
            Cardboard: { checked: false, value: '' },
            LightPlastic: { checked: false, value: '' },
            DensePlastic: { checked: false, value: '' },
            TextileWaste: { checked: false, value: '' },
            FoodWaste: { checked: false, value: '' },
            YardWaste: { checked: false, value: '' },
            Metals: { checked: false, value: '' },
            Glass: { checked: false, value: '' },
            Diapers: { checked: false, value: '' },
            AnimalDunk: { checked: false, value: '' },
            Wood: { checked: false, value: '' },
            Electronic: { checked: false, value: '' },
            Leather: { checked: false, value: '' },
            CDWaste: { checked: false, value: '' }, // Construction and Demolition Waste
          }
        },
        Commercial: {
          checked: false,
          subcategories: {
            Paper: { checked: false, value: '' },
            Cardboard: { checked: false, value: '' },
            LightPlastic: { checked: false, value: '' },
            DensePlastic: { checked: false, value: '' },
            TextileWaste: { checked: false, value: '' },
            FoodWaste: { checked: false, value: '' },
            YardWaste: { checked: false, value: '' },
            Metals: { checked: false, value: '' },
            Glass: { checked: false, value: '' },
            Diapers: { checked: false, value: '' },
            AnimalDunk: { checked: false, value: '' },
            Wood: { checked: false, value: '' },
            Electronic: { checked: false, value: '' },
            Leather: { checked: false, value: '' },
            CDWaste: { checked: false, value: '' },
          }
        },
        Industrial: {
          checked: false,
          subcategories: {
            Paper: { checked: false, value: '' },
            Cardboard: { checked: false, value: '' },
            LightPlastic: { checked: false, value: '' },
            DensePlastic: { checked: false, value: '' },
            TextileWaste: { checked: false, value: '' },
            FoodWaste: { checked: false, value: '' },
            YardWaste: { checked: false, value: '' },
            Metals: { checked: false, value: '' },
            Glass: { checked: false, value: '' },
            Diapers: { checked: false, value: '' },
            AnimalDunk: { checked: false, value: '' },
            Wood: { checked: false, value: '' },
            Electronic: { checked: false, value: '' },
            Leather: { checked: false, value: '' },
            CDWaste: { checked: false, value: '' },
          }
        },
        Hazardous: {
          checked: false,
          subcategories: {
            Needles: { checked: false, value: '' },
            Syringes: { checked: false, value: '' },
            Scalpels: { checked: false, value: '' },
            InfusionSets: { checked: false, value: '' },
            SawsKnives: { checked: false, value: '' },
            Blades: { checked: false, value: '' },
            Chemicals: { checked: false, value: '' },
          }
        }
      },
    });
    const [user, setUser] = useState(null);
    const auth = getAuth();
    const [infoWindow, setInfoWindow] = useState(null);

    useEffect(() => {
        onAuthStateChanged(auth, (loggedUser) => {
            if (loggedUser) {
                setUser(loggedUser);
            } else {
                alert("No user logged in!");
            }
        });
    }, []);

    useEffect(() => {
        if (window.google) {
            const googleMap = new window.google.maps.Map(document.getElementById("map"), {
                center: { lat: 31.5497, lng: 74.3436 },
                zoom: 12
            });
            setMap(googleMap);

            const newInfoWindow = new window.google.maps.InfoWindow();
            setInfoWindow(newInfoWindow);
        } else {
            console.error("Google Maps API not loaded properly.");
        }
    }, []);

    useEffect(() => {
        const fetchUserProjects = async () => {
            if (!user) return;
            const userUID = user.uid;
            const q = query(collection(db, "wasteData"), where("userUID", "==", userUID));
            const querySnapshot = await getDocs(q);
            const fetchedPolygons = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.polygonCoordinates) {
                    fetchedPolygons.push({ ...data, id: doc.id });
                }
            });
            setPolygons(fetchedPolygons);
        };

        fetchUserProjects();
    }, [user]);

    useEffect(() => {
        if (map && polygons.length > 0) {
            polygons.forEach((project) => {
                const polygon = new window.google.maps.Polygon({
                    paths: project.polygonCoordinates,
                    map: map,
                    fillColor: "#00FF00",
                    fillOpacity: 0.4,
                    strokeWeight: 2,
                    clickable: true
                });

                polygon.addListener("click", (event) => {
                    setSelectedPolygon(project);
                    setFormValues({
                        ucName: project.ucName,
                        population: "",
                        households: "",
                        incomeGroup: project.incomeGroup,
                    });

                    if (infoWindow) {
                        const content = `
                            <div>
                                <h3>${project.ucName}</h3>
                                <p><strong>Population:</strong> ${project.population}</p>
                                <p><strong>Households:</strong> ${project.households}</p>
                                <p><strong>Income Group:</strong> ${project.incomeGroup}</p>
                                <button id="update-btn">Update</button>
                            </div>
                        `;
                        infoWindow.setContent(content);
                        infoWindow.setPosition(event.latLng);
                        infoWindow.open(map);

                        // Add a click listener to the "Update" button inside the InfoWindow
                        window.google.maps.event.addListenerOnce(infoWindow, "domready", () => {
                            document
                                .getElementById("update-btn")
                                .addEventListener("click", () => setEditingPolygon(project));
                        });
                    }
                });
            });
        }
    }, [map, polygons, infoWindow]);

    const handleChange = (e) => {
        setFormValues({ ...formValues, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (editingPolygon) {
            try {
                const updatedPolygon = {
                    ucName: editingPolygon.ucName, // UC Name is static for now
                    population: Number(editingPolygon.population) + Number(formValues.population || 0),
                    households: Number(editingPolygon.households) + Number(formValues.households || 0),
                    incomeGroup: editingPolygon.incomeGroup, // Income Group remains the same
                };

                // Update Firestore with the new values
                const polygonDoc = doc(db, "wasteData", editingPolygon.id);
                await updateDoc(polygonDoc, {
                    population: updatedPolygon.population,
                    households: updatedPolygon.households,
                });

                // Update local state
                setPolygons(polygons.map((p) => (p.id === editingPolygon.id ? updatedPolygon : p)));
                alert("Values updated successfully!");
                setEditingPolygon(null); // Hide form after updating
            } catch (error) {
                console.error("Error updating Firestore:", error);
            }
        }
    };

    return (
        <div style={{ height: "500px", width: "100%" }}>
            <div id="map" style={{ height: "100%", width: "100%" }} />
            
            {/* Form only appears when the "Update" button is clicked */}
            {editingPolygon && (
                <form onSubmit={handleFormSubmit} style={{ marginTop: "20px" }}>
                    <h3>Update Project Information for {editingPolygon.ucName}</h3>
                    <label>Population:</label>
                    <input
                        type="number"
                        name="population"
                        value={formValues.population}
                        placeholder="Add to Population"
                        onChange={handleChange}
                      
                    />
                    <label>Households:</label>
                    <input
                        type="number"
                        name="households"
                        value={formValues.households}
                        placeholder="Add to Households"
                        onChange={handleChange}
                        
                    />
                    <button type="submit">Update Values</button>
                    <button type="button" onClick={() => setEditingPolygon(null)}>Cancel</button>
                </form>
            )}
        </div>
    );
};

export default GoogleMapComponent;
