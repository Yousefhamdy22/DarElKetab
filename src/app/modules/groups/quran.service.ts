import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Surah {
  id: number;
  name: string;
  ayahCount: number;
  revelation?: string;
  arabic?: string;
}

export interface Ayah {
  number: number;
  text: string;
  surahNumber: number;
}

@Injectable({
  providedIn: 'root'
})
export class QuranService {
  private apiUrl = 'assets/data/quran.json'; // Path to local JSON file with Quran data


  public quranData: Surah[] = [
    { id: 1, name: 'الفاتحة', ayahCount: 7, arabic: 'الفاتحة', revelation: 'مكية' },
    { id: 2, name: 'البقرة', ayahCount: 286, arabic: 'البقرة', revelation: 'مدنية' },
    { id: 3, name: 'آل عمران', ayahCount: 200, arabic: 'آل عمران', revelation: 'مدنية' },
    { id: 4, name: 'النساء', ayahCount: 176, arabic: 'النساء', revelation: 'مدنية' },
    { id: 5, name: 'المائدة', ayahCount: 120, arabic: 'المائدة', revelation: 'مدنية' },
    { id: 6, name: 'الأنعام', ayahCount: 165, arabic: 'الأنعام', revelation: 'مكية' },
    { id: 7, name: 'الأعراف', ayahCount: 206, arabic: 'الأعراف', revelation: 'مكية' },
    { id: 8, name: 'الأنفال', ayahCount: 75, arabic: 'الأنفال', revelation: 'مدنية' },
    { id: 9, name: 'التوبة', ayahCount: 129, arabic: 'التوبة', revelation: 'مدنية' },
    { id: 10, name: 'يونس', ayahCount: 109, arabic: 'يونس', revelation: 'مكية' },
    { id: 11, name: 'هود', ayahCount: 123, arabic: 'هود', revelation: 'مكية' },
    { id: 12, name: 'يوسف', ayahCount: 111, arabic: 'يوسف', revelation: 'مكية' },
    { id: 13, name: 'الرعد', ayahCount: 43, arabic: 'الرعد', revelation: 'مدنية' },
    { id: 14, name: 'إبراهيم', ayahCount: 52, arabic: 'إبراهيم', revelation: 'مكية' },
    { id: 15, name: 'الحجر', ayahCount: 99, arabic: 'الحجر', revelation: 'مكية' },
    { id: 16, name: 'النحل', ayahCount: 128, arabic: 'النحل', revelation: 'مكية' },
    { id: 17, name: 'الإسراء', ayahCount: 111, arabic: 'الإسراء', revelation: 'مكية' },
    { id: 18, name: 'الكهف', ayahCount: 110, arabic: 'الكهف', revelation: 'مكية' },
    { id: 19, name: 'مريم', ayahCount: 98, arabic: 'مريم', revelation: 'مكية' },
    { id: 20, name: 'طه', ayahCount: 135, arabic: 'طه', revelation: 'مكية' },
    { id: 21, name: 'الأنبياء', ayahCount: 112, arabic: 'الأنبياء', revelation: 'مكية' },
    { id: 22, name: 'الحج', ayahCount: 78, arabic: 'الحج', revelation: 'مدنية' },
    { id: 23, name: 'المؤمنون', ayahCount: 118, arabic: 'المؤمنون', revelation: 'مكية' },
    { id: 24, name: 'النور', ayahCount: 64, arabic: 'النور', revelation: 'مدنية' },
    { id: 25, name: 'الفرقان', ayahCount: 77, arabic: 'الفرقان', revelation: 'مكية' },
    { id: 26, name: 'الشعراء', ayahCount: 227, arabic: 'الشعراء', revelation: 'مكية' },
    { id: 27, name: 'النمل', ayahCount: 93, arabic: 'النمل', revelation: 'مكية' },
    { id: 28, name: 'القصص', ayahCount: 88, arabic: 'القصص', revelation: 'مكية' },
    { id: 29, name: 'العنكبوت', ayahCount: 69, arabic: 'العنكبوت', revelation: 'مكية' },
    { id: 30, name: 'الروم', ayahCount: 60, arabic: 'الروم', revelation: 'مكية' },
    { id: 31, name: 'لقمان', ayahCount: 34, arabic: 'لقمان', revelation: 'مكية' },
    { id: 32, name: 'السجدة', ayahCount: 30, arabic: 'السجدة', revelation: 'مكية' },
    { id: 33, name: 'الأحزاب', ayahCount: 73, arabic: 'الأحزاب', revelation: 'مدنية' },
    { id: 34, name: 'سبأ', ayahCount: 54, arabic: 'سبأ', revelation: 'مكية' },
    { id: 35, name: 'فاطر', ayahCount: 45, arabic: 'فاطر', revelation: 'مكية' },
    { id: 36, name: 'يس', ayahCount: 83, arabic: 'يس', revelation: 'مكية' },
    { id: 37, name: 'الصافات', ayahCount: 182, arabic: 'الصافات', revelation: 'مكية' },
    { id: 38, name: 'ص', ayahCount: 88, arabic: 'ص', revelation: 'مكية' },
    { id: 39, name: 'الزمر', ayahCount: 75, arabic: 'الزمر', revelation: 'مكية' },
    { id: 40, name: 'غافر', ayahCount: 85, arabic: 'غافر', revelation: 'مكية' },
    { id: 41, name: 'فصلت', ayahCount: 54, arabic: 'فصلت', revelation: 'مكية' },
    { id: 42, name: 'الشورى', ayahCount: 53, arabic: 'الشورى', revelation: 'مكية' },
    { id: 43, name: 'الزخرف', ayahCount: 89, arabic: 'الزخرف', revelation: 'مكية' },
    { id: 44, name: 'الدخان', ayahCount: 59, arabic: 'الدخان', revelation: 'مكية' },
    { id: 45, name: 'الجاثية', ayahCount: 37, arabic: 'الجاثية', revelation: 'مكية' },
    { id: 46, name: 'الأحقاف', ayahCount: 35, arabic: 'الأحقاف', revelation: 'مكية' },
    { id: 47, name: 'محمد', ayahCount: 38, arabic: 'محمد', revelation: 'مدنية' },
    { id: 48, name: 'الفتح', ayahCount: 29, arabic: 'الفتح', revelation: 'مدنية' },
    { id: 49, name: 'الحجرات', ayahCount: 18, arabic: 'الحجرات', revelation: 'مدنية' },
    { id: 50, name: 'ق', ayahCount: 45, arabic: 'ق', revelation: 'مكية' },
    { id: 51, name: 'الذاريات', ayahCount: 60, arabic: 'الذاريات', revelation: 'مكية' },
    { id: 52, name: 'الطور', ayahCount: 49, arabic: 'الطور', revelation: 'مكية' },
    { id: 53, name: 'النجم', ayahCount: 62, arabic: 'النجم', revelation: 'مكية' },
    { id: 54, name: 'القمر', ayahCount: 55, arabic: 'القمر', revelation: 'مكية' },
    { id: 55, name: 'الرحمن', ayahCount: 78, arabic: 'الرحمن', revelation: 'مدنية' },
    { id: 56, name: 'الواقعة', ayahCount: 96, arabic: 'الواقعة', revelation: 'مكية' },
    { id: 57, name: 'الحديد', ayahCount: 29, arabic: 'الحديد', revelation: 'مدنية' },
    { id: 58, name: 'المجادلة', ayahCount: 22, arabic: 'المجادلة', revelation: 'مدنية' },
    { id: 59, name: 'الحشر', ayahCount: 24, arabic: 'الحشر', revelation: 'مدنية' },
    { id: 60, name: 'الممتحنة', ayahCount: 13, arabic: 'الممتحنة', revelation: 'مدنية' },
    { id: 61, name: 'الصف', ayahCount: 14, arabic: 'الصف', revelation: 'مدنية' },
    { id: 62, name: 'الجمعة', ayahCount: 11, arabic: 'الجمعة', revelation: 'مدنية' },
    { id: 63, name: 'المنافقون', ayahCount: 11, arabic: 'المنافقون', revelation: 'مدنية' },
    { id: 64, name: 'التغابن', ayahCount: 18, arabic: 'التغابن', revelation: 'مدنية' },
    { id: 65, name: 'الطلاق', ayahCount: 12, arabic: 'الطلاق', revelation: 'مدنية' },
    { id: 66, name: 'التحريم', ayahCount: 12, arabic: 'التحريم', revelation: 'مدنية' },
    { id: 67, name: 'الملك', ayahCount: 30, arabic: 'الملك', revelation: 'مكية' },
    { id: 68, name: 'القلم', ayahCount: 52, arabic: 'القلم', revelation: 'مكية' },
    { id: 69, name: 'الحاقة', ayahCount: 52, arabic: 'الحاقة', revelation: 'مكية' },
    { id: 70, name: 'المعارج', ayahCount: 44, arabic: 'المعارج', revelation: 'مكية' },
    { id: 71, name: 'نوح', ayahCount: 28, arabic: 'نوح', revelation: 'مكية' },
    { id: 72, name: 'الجن', ayahCount: 28, arabic: 'الجن', revelation: 'مكية' },
    { id: 73, name: 'المزمل', ayahCount: 20, arabic: 'المزمل', revelation: 'مكية' },
    { id: 74, name: 'المدثر', ayahCount: 56, arabic: 'المدثر', revelation: 'مكية' },
    { id: 75, name: 'القيامة', ayahCount: 40, arabic: 'القيامة', revelation: 'مكية' },
    { id: 76, name: 'الإنسان', ayahCount: 31, arabic: 'الإنسان', revelation: 'مدنية' },
    { id: 77, name: 'المرسلات', ayahCount: 50, arabic: 'المرسلات', revelation: 'مكية' },
    { id: 78, name: 'النبأ', ayahCount: 40, arabic: 'النبأ', revelation: 'مكية' },
    { id: 79, name: 'النازعات', ayahCount: 46, arabic: 'النازعات', revelation: 'مكية' },
    { id: 80, name: 'عبس', ayahCount: 42, arabic: 'عبس', revelation: 'مكية' },
    { id: 81, name: 'التكوير', ayahCount: 29, arabic: 'التكوير', revelation: 'مكية' },
    { id: 82, name: 'الإنفطار', ayahCount: 19, arabic: 'الإنفطار', revelation: 'مكية' },
    { id: 83, name: 'المطففين', ayahCount: 36, arabic: 'المطففين', revelation: 'مكية' },
    { id: 84, name: 'الإنشقاق', ayahCount: 25, arabic: 'الإنشقاق', revelation: 'مكية' },
    { id: 85, name: 'البروج', ayahCount: 22, arabic: 'البروج', revelation: 'مكية' },
    { id: 86, name: 'الطارق', ayahCount: 17, arabic: 'الطارق', revelation: 'مكية' },
    { id: 87, name: 'الأعلى', ayahCount: 19, arabic: 'الأعلى', revelation: 'مكية' },
    { id: 88, name: 'الغاشية', ayahCount: 26, arabic: 'الغاشية', revelation: 'مكية' },
    { id: 89, name: 'الفجر', ayahCount: 30, arabic: 'الفجر', revelation: 'مكية' },
    { id: 90, name: 'البلد', ayahCount: 20, arabic: 'البلد', revelation: 'مكية' },
    { id: 91, name: 'الشمس', ayahCount: 15, arabic: 'الشمس', revelation: 'مكية' },
    { id: 92, name: 'الليل', ayahCount: 21, arabic: 'الليل', revelation: 'مكية' },
    { id: 93, name: 'الضحى', ayahCount: 11, arabic: 'الضحى', revelation: 'مكية' },
    { id: 94, name: 'الشرح', ayahCount: 8, arabic: 'الشرح', revelation: 'مكية' },
    { id: 95, name: 'التين', ayahCount: 8, arabic: 'التين', revelation: 'مكية' },
    { id: 96, name: 'العلق', ayahCount: 19, arabic: 'العلق', revelation: 'مكية' },
    { id: 97, name: 'القدر', ayahCount: 5, arabic: 'القدر', revelation: 'مكية' },
    { id: 98, name: 'البينة', ayahCount: 8, arabic: 'البينة', revelation: 'مدنية' },
    { id: 99, name: 'الزلزلة', ayahCount: 8, arabic: 'الزلزلة', revelation: 'مدنية' },
    { id: 100, name: 'العاديات', ayahCount: 11, arabic: 'العاديات', revelation: 'مكية' },
    { id: 101, name: 'القارعة', ayahCount: 11, arabic: 'القارعة', revelation: 'مكية' },
    { id: 102, name: 'التكاثر', ayahCount: 8, arabic: 'التكاثر', revelation: 'مكية' },
    { id: 103, name: 'العصر', ayahCount: 3, arabic: 'العصر', revelation: 'مكية' },
    { id: 104, name: 'الهمزة', ayahCount: 9, arabic: 'الهمزة', revelation: 'مكية' },
    { id: 105, name: 'الفيل', ayahCount: 5, arabic: 'الفيل', revelation: 'مكية' },
    { id: 106, name: 'قريش', ayahCount: 4, arabic: 'قريش', revelation: 'مكية' },
    { id: 107, name: 'الماعون', ayahCount: 7, arabic: 'الماعون', revelation: 'مكية' },
    { id: 108, name: 'الكوثر', ayahCount: 3, arabic: 'الكوثر', revelation: 'مكية' },
    { id: 109, name: 'الكافرون', ayahCount: 6, arabic: 'الكافرون', revelation: 'مكية' },
    { id: 110, name: 'النصر', ayahCount: 3, arabic: 'النصر', revelation: 'مدنية' },
    { id: 111, name: 'المسد', ayahCount: 5, arabic: 'المسد', revelation: 'مكية' },
    { id: 112, name: 'الإخلاص', ayahCount: 4, arabic: 'الإخلاص', revelation: 'مكية' },
    { id: 113, name: 'الفلق', ayahCount: 5, arabic: 'الفلق', revelation: 'مكية' },
    { id: 114, name: 'الناس', ayahCount: 6, arabic: 'الناس', revelation: 'مكية' }
  ];

  constructor(private http: HttpClient) {}

  // Get all surahs
  getSurahs(): Observable<Surah[]> {
    return of(this.quranData);
  }

  // Get a specific surah by ID
  getSurah(id: number): Observable<Surah | undefined> {
    return of(this.quranData.find(surah => surah.id === id));
  }

  // Get ayah range for a surah
  getAyahRange(surahId: number, startAyah: number, endAyah: number): Observable<Ayah[]> {
    return this.http.get<Ayah[]>(`${this.apiUrl}?surah=${surahId}&from=${startAyah}&to=${endAyah}`).pipe(
      catchError(() => of([]))
    );
  }

  // Get all ayahs for a surah
  getAyahsForSurah(surahId: number): Observable<Ayah[]> {
    const surah = this.quranData.find(s => s.id === surahId);
    if (!surah) return of([]);
    
    return this.http.get<Ayah[]>(`${this.apiUrl}?surah=${surahId}`).pipe(
      catchError(() => {
        // Fallback: generate ayah numbers if API fails
        const ayahs = [];
        for (let i = 1; i <= surah.ayahCount; i++) {
          ayahs.push({ number: i, text: `آية ${i}`, surahNumber: surahId });
        }
        return of(ayahs);
      })
    );
  }

  // Get ayah options for dropdown (numbers only)
  getAyahOptions(surahId: number): Observable<{label: string, value: number}[]> {
    const surah = this.quranData.find(s => s.id === surahId);
    if (!surah) return of([]);
    
    const options = [];
    for (let i = 1; i <= surah.ayahCount; i++) {
      options.push({ label: `آية ${i}`, value: i });
    }
    return of(options);
  }

  // Search across Quran text
  searchQuran(query: string): Observable<Ayah[]> {
    return this.http.get<Ayah[]>(`${this.apiUrl}?search=${query}`).pipe(
      catchError(() => of([]))
    );
  }
}