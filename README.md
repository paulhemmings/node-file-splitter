# node-file-splitter
Splits a large file into equal sized chunks. Preserves the first line across all generated files. Preserves extension.

### What it does
Parses a single input file, and splits the content into n number of equally sized files, preserving the header line in each. This is useful for splitting large CSV files into manageable chunks for Salesforce Data Loader.

### Use case
Say you have a data extract resulted in a single CSV file of a 10s of millions of rows. Salesforce Data Loader has issues loading files of more than a few million at a time. You therefore want to split the data up into chunks of 1 million rows each. The chunks all need the original header row, so Data Loader can map the data correctly.

### Installation
```
$ git clone https://github.com/paulhemmings/node-file-splitter
$ cd node-file-splitter
$ npm install
$ npm link
```

#### Example
The file you want to split is called "very-big-file.csv". Running the following in the home folder of the file will generate 10 files. The files preserve the original name and extension, but with a sequential zero based index.

```
$ file-splitter ./very-big-file.csv 10
```

This will generate the following equally sized files in parallel.

```
very-big-file.0.csv
very-big-file.1.csv
very-big-file.2.csv
very-big-file.3.csv
very-big-file.4.csv
very-big-file.5.csv
very-big-file.6.csv
very-big-file.7.csv
very-big-file.8.csv
very-big-file.9.csv
```
