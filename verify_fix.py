import requests
import sys

def verify_products_endpoint():
    url = "http://127.0.0.1:8000/api/v1/products/?skip=0&limit=5"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            print("Response status: 200 OK")
            if isinstance(data, list) and len(data) > 0:
                first_product = data[0]
                if "image_url" in first_product:
                    print(f"Success: 'image_url' found in product response. Value: {first_product['image_url']}")
                else:
                    print("Error: 'image_url' NOT found in product keys:", first_product.keys())
                    sys.exit(1)
            elif isinstance(data, dict) and "items" in data: # Pagination structure might vary
                 first_product = data["items"][0] if data["items"] else None
                 if first_product and "image_url" in first_product:
                     print(f"Success: 'image_url' found in product response. Value: {first_product['image_url']}")
                 else:
                     print("Error: 'image_url' check failed or no products returned.")
            else:
                print("Warning: No products returned to verify schema, but request was successful.")
                print("Response data:", data)
        else:
            print(f"Error: Request failed with status code {response.status_code}")
            print("Response:", response.text)
            sys.exit(1)
            
    except Exception as e:
        print(f"Exception during verification: {e}")
        sys.exit(1)

if __name__ == "__main__":
    verify_products_endpoint()
