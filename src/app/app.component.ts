import { Component, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { FormBuilder, FormGroup, Validators, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { ErrorStateMatcher, DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Employee } from './employee';
import { HttpErrorResponse } from '@angular/common/http';
import { ProgramService } from './program.service';

export interface Subject {
  name: string;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  myForm: FormGroup;
  @ViewChild('chipList', { static: true }) chipList;
  FoodHabitList = [
    { ItemText: '葷', ItemValue: '葷' },
    { ItemText: '素', ItemValue: '素' }]
  SubjectsArray: Subject[] = [];
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  // 定義分頁
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  // 定義排序
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  //定義table欄位
  displayedColumns: string[] = ['EDIT_BUTTON', 'DELETE_BUTTON', 'id', 'name'
    , 'gender', 'dob', 'driver', 'foodhabit'];
  public tridataTable = new MatTableDataSource<any>();
  public totalCount = 0;
  public tridata: Array<any>;
  public fakedata = [
    { id: 'a0001', name: '張三', gender: '男', dob: '1981/10/03', driver: '騎車、開車、公車', foodhabit: '葷' },
    { id: 'a0002', name: '東施', gender: '女', dob: '1984/07/05', driver: '開車、公車', foodhabit: '素' },
    { id: 'a0004', name: '李四', gender: '男', dob: '1988/09/08', driver: '開車', foodhabit: '葷' },
    { id: 'a0005', name: '李四端', gender: '男', dob: '1998/03/08', driver: '騎車、開車', foodhabit: '葷' },
    { id: 'a0006', name: '大豬', gender: '男', dob: '1988/07/08', driver: '騎車、公車', foodhabit: '素' },
    { id: 'a0007', name: '小明', gender: '女', dob: '1980/09/08', driver: '騎車、公車', foodhabit: '素' },
    { id: 'a0008', name: '大明', gender: '男', dob: '1999/09/18', driver: '騎車、公車', foodhabit: '素' },
    { id: 'a0009', name: '老五', gender: '男', dob: '2003/12/30', driver: '騎車', foodhabit: '葷' },
  ]

  constructor(public fb: FormBuilder,
    private dateAdapter: DateAdapter<NativeDateAdapter>,
    private programService: ProgramService) { }

  ngOnInit(): void {
    // 定義material datapicker語系
    this.dateAdapter.setLocale('zh-TW');
    this.reactiveForm()
    this.tridataTable.data = this.fakedata;
    this.tridataTable.data.forEach(x => x.dob = new Date(x.dob));
    this.tridataTable.paginator = this.paginator
    this.tridataTable.sort = this.sort
    this.totalCount = this.tridataTable.data.length
    // this.getData();
  }
  //撈後端JSON資料
  getData() {
    this.programService.getData()
      .subscribe(
        (response: any) => {
          this.tridataTable.data = response;
          this.tridataTable.data.forEach(x =>
            x.dob = new Date(x.dob));
        }
        , (error: HttpErrorResponse) => this.programService.HandleError(error)
      );
  }

  /* Reactive form setting*/
  reactiveForm() {
    this.myForm = this.fb.group({
      id: ['', [Validators.required]],
      name: ['', [Validators.required]],
      email: ['', [Validators.required]],//
      gender: ['女'],
      dob: ['', [Validators.required]],
      foodhabit: [''],
      subjects: [this.SubjectsArray]//
    })
  }
  /* Date */
  toDate(e) {
    var convertDate = new Date(e.target.value).toISOString().substring(0, 10);
    this.myForm.get('dob').setValue(convertDate, {
      onlyself: true
    })
  }
  /* Add dynamic languages */
  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    // Add language
    if ((value || '').trim() && this.SubjectsArray.length < 5) {
      this.SubjectsArray.push({ name: value.trim() })
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }
  }
  /* Remove dynamic languages */
  remove(subject: Subject): void {
    const index = this.SubjectsArray.indexOf(subject);
    if (index >= 0) {
      this.SubjectsArray.splice(index, 1);
    }
  }

  submitForm() {
    console.log(this.myForm.value)
  }

  selectRecord(selectItem: Employee) {
    console.log(this.myForm.get('foodhabit'));
    this.myForm.get('id').setValue(selectItem.id);
    this.myForm.get('name').setValue(selectItem.name);
    this.myForm.get('gender').setValue(selectItem.gender);
    this.myForm.get('dob').setValue(selectItem.dob);
    this.myForm.get('foodhabit').setValue(selectItem.foodhabit);
    // this.myForm.get('id').setValue(selectValue.id);
  }
  addData(record) {
    var targetData = this.tridataTable.data;
    if (targetData.findIndex(x => x.id === record.id) > -1) {
      alert('該筆已存在，請重新執行!');
      return false;
    }
    record.id = this.getEmployeeID();
    targetData.unshift(record);
    this.tridataTable.data = targetData;
    this.totalCount = this.tridataTable.data.length
  }
  updateData(record) {
    var targetData = this.tridataTable.data;
    //修改陣列內元素
    const UpdateIdx = targetData.findIndex(x => x.id === record.id)
    targetData.splice(UpdateIdx, 1, record);
    this.tridataTable.data = targetData;
  }
  deleteData(record) {
    var targetData = this.tridataTable.data;
    //刪除陣列內元素
    const DelIdx = targetData.findIndex(x => x.id === record.id);
    targetData.splice(DelIdx, 1);
    this.tridataTable.data = targetData;
  }
  getEmployeeID() {
    var roundID = Math.floor(Math.random() * 100) + 1
    var EmployeeID = 'a00' + roundID.toString();
    console.log(EmployeeID);
    return EmployeeID;
  }
  /* Handle form errors in Angular 8 */
  public errorHandling = (control: string, error: string) => {
    return this.myForm.controls[control].hasError(error);
  }

}
