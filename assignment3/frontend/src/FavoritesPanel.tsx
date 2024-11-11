import { Table, Button } from 'react-bootstrap';
import { BACKEND_URL } from '../config';

interface FavoritesPanelProps {
    favorites: { city: string, state: string }[];
    setFavorites: React.Dispatch<React.SetStateAction<{ city: string, state: string }[]>>
}

const FavoritesPanel: React.FC<FavoritesPanelProps> = ({ favorites, setFavorites }) => {
  const handleDelete = async (city: string, state: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/favorites`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city, state }),
      });

      if (response.ok) {
        // Remove the deleted city/state from the list
        setFavorites(favorites.filter(fav => !(fav.city === city && fav.state === state)));
      } else {
        console.error("Failed to delete favorite");
      }
    } catch (error) {
      console.error("Error deleting favorite:", error);
    }
  };

  return (
    <div>
      <h2>Favorite Cities and States</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>City</th>
            <th>State</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {favorites.map((fav, index) => (
            <tr key={`${fav.city}-${fav.state}`}>
              <td>{index + 1}</td>
              <td>{fav.city}</td>
              <td>{fav.state}</td>
              <td>
                <Button variant="danger" onClick={() => handleDelete(fav.city, fav.state)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default FavoritesPanel;
