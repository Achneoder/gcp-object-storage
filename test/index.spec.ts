import { Writable } from 'stream';
import { ObjectWriter } from '../src/index';

describe('writeObject', () => {
  const dataObject = {
    key: 'value',
    someNumber: 1234786.89,
    array: [{ id: 1 }, { id: 2 }]
  };

  let storageWriter: ObjectWriter;

  beforeEach(() => {
    storageWriter = new ObjectWriter();
    // @ts-ignore
    storageWriter.createWriteStream = jest.fn(() => {
      return new Writable({
        write(chunk, encoding, callback) {
          callback();
        }
      });
    });
  });

  it('should resolve', () => {
    return storageWriter.writeObject(dataObject, 'sample-bucket', 'filename');
  });

  it('should fail with missing bucket', async () => {
    const result = storageWriter.writeObject(dataObject, '', 'filename');
    await expect(result).rejects.toMatch('no targetBucket or filename provided');
  });

  it('should fail with missing filename', async () => {
    const result = storageWriter.writeObject(dataObject, 'my-bucket', '');
    await expect(result).rejects.toMatch('no targetBucket or filename provided');
  });

  it('should fail with missing data', async () => {
    // @ts-ignore
    const result = storageWriter.writeObject(undefined, 'my-bucket', 'filename');
    await expect(result).rejects.toMatch('no data to write');
  });

  it('should fail with error in stream', async () => {
    // @ts-ignore
    storageWriter.createWriteStream = jest.fn(() => {
      return new Writable({
        write(chunk, encoding, callback) {
          callback(new Error('error in writing to stream'));
        }
      });
    });
    // @ts-ignore
    const result = storageWriter.writeObject(dataObject, 'my-bucket', 'filename');
    await expect(result).rejects.toThrowError();
  });
});