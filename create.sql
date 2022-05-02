CREATE TABLE [dbo].[weather](
	[WeatherID] [int] IDENTITY(1,1) NOT NULL,
	[LocationID] [int] NOT NULL,
	[date] [datetime] NOT NULL,
	[temperature] [int] NOT NULL,
	[description] [varchar](100) NOT NULL
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[Locations](
	[LocationID] [int] IDENTITY(1,1) NOT NULL,
	[postcode] [varchar](15) NOT NULL
) ON [PRIMARY]
GO
