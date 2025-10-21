from data_preprocessing import preprocess_data

# When loading training data
train_data = pd.read_csv('train_data.csv')
train_data = preprocess_data(train_data)

# Fit your model
model.fit(train_data, y_train)

# When loading test/prediction data
test_data = pd.read_csv('test_data.csv')
test_data = preprocess_data(test_data)

# Make predictions
predictions = model.predict(test_data)
