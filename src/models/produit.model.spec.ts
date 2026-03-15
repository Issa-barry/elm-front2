import { Produit } from './produit.model';

describe('Produit model', () => {
    it('should cast numeric API fields in fromApi()', () => {
        const produit = Produit.fromApi({
            id: 1,
            nom: 'Produit test',
            prix_usine: '1500',
            prix_vente: '2000',
            prix_achat: '1000',
            cout: '800',
            seuil_alerte_stock: '5',
        });

        expect(produit.prix_usine).toBe(1500);
        expect(produit.prix_vente).toBe(2000);
        expect(produit.prix_achat).toBe(1000);
        expect(produit.cout).toBe(800);
        expect(produit.seuil_alerte_stock).toBe(5);
    });

    it('should return default image when no image_url is provided', () => {
        const produit = new Produit({ nom: 'Sans image', image_url: null });
        expect(produit.getImageUrl()).toBe('assets/demo/images/no-product.png');
    });

    it('should keep absolute image url unchanged', () => {
        const produit = new Produit({ image_url: 'https://cdn.example.com/image.png' });
        expect(produit.getImageUrl()).toBe('https://cdn.example.com/image.png');
    });

    it('should build local image path for filename values', () => {
        const produit = new Produit({ image_url: 'photo.png' });
        expect(produit.getImageUrl()).toBe('assets/demo/images/produits/photo.png');
    });
});
