# Profile Repo Code Counter

This app scans all repos in your GitHub profile and counts your total lines of code. Once it's done, it adds the following text to the `id` field in your readMe file, which is "update_code_counter":
"This profile contains a total of xx lines of code across all projects. We're growing steadily."

## How It Works

### 1. Set Environment Variables

First, add your GitHub username and token information to your `.env` file:
```env
GITHUB_USERNAME=your_github_username
GITHUB_TOKEN=your_github_token
```

### 2. Specify Which Files to Exclude

Add the names of the files you don't want to include in the count to the 'ignored_files.txt' file. For example:
```
package-lock.json
package.json
```

### 3. Update Your ReadMe File

Add the following line to your ReadMe file:
```

<div id="update_code_counter"></div>
```

### 4. Run the Python Script
Run the Python script and wait for it to complete:
```

python update_readme.py
```

## Example Usage

```python
# Install the required dependencies
pip install -r requirements.txt

# Run the script
python script.py

```

Enjoy! 🎉 

----


# Profile Repo Code Counter

Bu uygulama, GitHub profilinizdeki tüm repoları tarar ve toplam kod satırınızı sayar. İşlem tamamlandığında, readMe dosyanızda bulunan `id`'si "update_code_counter" olan alana şu metni ekler: 
"This profile contains a total of xx lines of code across all projects. We're growing steadily."

## Nasıl Çalışır

### 1. Ortam Değişkenlerini Ayarlayın

Öncelikle `.env` dosyanıza GitHub kullanıcı adınızı ve token bilgilerinizi ekleyin:
```env
GITHUB_USERNAME=your_github_username
GITHUB_TOKEN=your_github_token
```

### 2. Dahil Edilmeyecek Dosyaları Belirleyin

'ignored_files.txt' dosyasına, sayım işlemine dahil edilmesini istemediğiniz dosyaların isimlerini ekleyin. Örneğin:
``` 
package-lock.json
package.json
 ```

 ### 3. ReadMe Dosyanızı Güncelleyin

 ReadMe dosyanıza şu satırı ekleyin:
 ``` 
 <div id="update_code_counter"></div>
 ```

 ### 4. Python Scriptini Çalıştırın
 Python scriptini çalıştırın ve işlemin tamamlanmasını bekleyin:
 ```
 python update_readme.py
 ```

## Örnek Kullanım

```python 
# Gerekli bağımlılıkları yükleyin
pip install -r requirements.txt

# Scripti çalıştırın
python script.py

```

İyi eğlenceler! 🎉
